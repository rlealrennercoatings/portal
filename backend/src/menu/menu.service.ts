import { Injectable } from '@nestjs/common';
import Database = require('better-sqlite3');
import * as fs from 'fs';
import * as path from 'path';

export interface MenuApplication {
  id: string;
  name: string;
  route?: string;
  environments?: string[];
  allowedGroups: string[];
}

export interface MenuArea {
  id: string;
  name: string;
  environments?: string[];
  applications: MenuApplication[];
}

const DEFAULT_AREAS: MenuArea[] = [
  {
    id: 'financeiro',
    name: 'Financeiro',
    environments: ['*'],
    applications: [
      { id: 'controladoria', name: 'Controladoria', route: '/dashboard', environments: ['*'], allowedGroups: ['*'] },
      { id: 'fluxo-caixa', name: 'Fluxo de caixa', route: '/dashboard', environments: ['br-prod', 'br-homolog'], allowedGroups: ['sup', 'fin'] },
    ],
  },
  {
    id: 'logistica',
    name: 'Logística',
    environments: ['*'],
    applications: [
      { id: 'separacao-picking', name: 'Separação (Picking)', route: '/apps/separacao-picking', environments: ['br-prod', 'br-homolog', 'cl-prod'], allowedGroups: ['sup', 'w12'] },
      { id: 'confirma-saida-transporte', name: 'Confirma saída transporte', route: '/apps/confirma-saida-transporte', environments: ['*'], allowedGroups: ['*'] },
    ],
  },
  {
    id: 'manufatura',
    name: 'Manufatura',
    environments: ['br-prod'],
    applications: [{ id: 'planejamento-producao', name: 'Planejamento de produção', route: '/dashboard', environments: ['br-prod'], allowedGroups: ['sup', 'manufatura'] }],
  },
  {
    id: 'recursos-humanos',
    name: 'Recursos Humanos',
    environments: ['br-prod'],
    applications: [{ id: 'folha-ponto', name: 'Folha e ponto', route: '/dashboard', environments: ['br-prod'], allowedGroups: ['sup', 'rh'] }],
  },
  {
    id: 'foundation',
    name: 'Foundation',
    environments: ['*'],
    applications: [
      { id: 'gestao-acesso', name: 'Gestão de acessos', route: '/dashboard', environments: ['*'], allowedGroups: ['sup'] },
      { id: 'usuarios-permissoes', name: 'Usuários e permissões', route: '/dashboard', environments: ['*'], allowedGroups: ['sup', 'foundation'] },
      { id: 'menu-admin', name: 'Administração do menu', route: '/menu-admin', environments: ['*'], allowedGroups: ['sup'] },
    ],
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    environments: ['*'],
    applications: [
      { id: 'monitoramento', name: 'Monitoramento', route: '/dashboard', environments: ['*'], allowedGroups: ['sup', 'ti'] },
      { id: 'integracoes', name: 'Integrações', route: '/dashboard', environments: ['*'], allowedGroups: ['sup', 'tecnologia'] },
    ],
  },
];

const DB_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, process.env.NODE_ENV === 'test' ? 'portal-menu.test.db' : 'portal-menu.db');

@Injectable()
export class MenuService {
  private readonly db: Database.Database;

  constructor() {
    fs.mkdirSync(DB_DIR, { recursive: true });
    if (process.env.NODE_ENV === 'test' && fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }
    this.db = new Database(DB_PATH);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS areas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        environments TEXT NOT NULL DEFAULT '[]'
      );

      CREATE TABLE IF NOT EXISTS applications (
        id TEXT,
        area_id TEXT NOT NULL,
        name TEXT NOT NULL,
        route TEXT NOT NULL DEFAULT '/dashboard',
        environments TEXT NOT NULL DEFAULT '[]',
        allowed_groups TEXT NOT NULL DEFAULT '[]',
        PRIMARY KEY (id, area_id),
        FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE
      );
    `);

    this.seedDefaultAreas();
  }

  close(): void {
    this.db.close();
  }

  getAllAreas(): MenuArea[] {
    const areas = this.db.prepare('SELECT * FROM areas ORDER BY name COLLATE NOCASE').all() as Array<{ id: string; name: string; environments: string }>;

    return areas.map((area) => {
      const applications = this.db
        .prepare('SELECT * FROM applications WHERE area_id = ? ORDER BY name COLLATE NOCASE')
        .all(area.id) as Array<{ id: string; name: string; route: string; environments: string; allowed_groups: string }>;

      return {
        id: area.id,
        name: area.name,
        environments: this.parseListFromDb(area.environments),
        applications: applications.map((application) => ({
          id: application.id,
          name: application.name,
          route: application.route,
          environments: this.parseListFromDb(application.environments),
          allowedGroups: this.parseListFromDb(application.allowed_groups),
        })),
      };
    });
  }

  createArea(area: Partial<MenuArea> & { applications?: Array<Partial<MenuApplication>> } = {}): MenuArea {
    const normalizedArea: MenuArea = {
      id: area.id ?? this.slugify(area.name ?? 'nova-area'),
      name: area.name ?? 'Nova área',
      environments: [],
      applications: (area.applications ?? []).map((application) => this.normalizeApplication(application)),
    };

    const uniqueAreaId = this.ensureUniqueAreaId(normalizedArea.id);
    this.db.prepare('INSERT INTO areas (id, name, environments) VALUES (?, ?, ?)').run(uniqueAreaId, normalizedArea.name, JSON.stringify(normalizedArea.environments));

    normalizedArea.id = uniqueAreaId;
    normalizedArea.applications.forEach((application) => {
      const uniqueApplicationId = this.ensureUniqueApplicationId(uniqueAreaId, application.id);
      this.db
        .prepare('INSERT INTO applications (id, area_id, name, route, environments, allowed_groups) VALUES (?, ?, ?, ?, ?, ?)')
        .run(uniqueApplicationId, uniqueAreaId, application.name, application.route ?? '/dashboard', JSON.stringify(application.environments ?? []), JSON.stringify(application.allowedGroups ?? []));
      application.id = uniqueApplicationId;
    });

    return this.cloneArea(normalizedArea);
  }

  updateArea(areaId: string, changes: Partial<MenuArea>): MenuArea | undefined {
    const area = this.getArea(areaId);
    if (!area) {
      return undefined;
    }

    const updatedArea: MenuArea = {
      ...area,
      ...changes,
      name: changes.name?.trim() ? changes.name.trim() : area.name,
      environments: [],
      applications: area.applications,
    };

    this.db
      .prepare('UPDATE areas SET name = ?, environments = ? WHERE id = ?')
      .run(updatedArea.name, JSON.stringify(updatedArea.environments), areaId);

    return this.cloneArea(updatedArea);
  }

  createApplication(areaId: string, application: Partial<MenuApplication>): MenuApplication | undefined {
    const area = this.getArea(areaId);
    if (!area) {
      return undefined;
    }

    const normalizedApplication = this.normalizeApplication(application);
    const uniqueApplicationId = this.ensureUniqueApplicationId(areaId, normalizedApplication.id);
    normalizedApplication.id = uniqueApplicationId;

    this.db
      .prepare('INSERT INTO applications (id, area_id, name, route, environments, allowed_groups) VALUES (?, ?, ?, ?, ?, ?)')
      .run(uniqueApplicationId, areaId, normalizedApplication.name, normalizedApplication.route ?? '/dashboard', JSON.stringify(normalizedApplication.environments ?? []), JSON.stringify(normalizedApplication.allowedGroups ?? []));

    return this.cloneApplication(normalizedApplication);
  }

  updateApplication(areaId: string, applicationId: string, changes: Partial<MenuApplication>): MenuApplication | undefined {
    const area = this.getArea(areaId);
    if (!area) {
      return undefined;
    }

    const application = area.applications.find((item) => item.id === applicationId);
    if (!application) {
      return undefined;
    }

    const allowedGroups = this.normalizeGroups(changes.allowedGroups ?? application.allowedGroups ?? []);
    const protectedAllowedGroups = this.ensureRequiredGroup(areaId, applicationId, allowedGroups);

    const updatedApplication: MenuApplication = {
      ...application,
      ...changes,
      name: changes.name?.trim() ? changes.name.trim() : application.name,
      route: changes.route?.trim() ? changes.route.trim() : application.route ?? '/dashboard',
      environments: this.normalizeEnvironments(changes.environments ?? application.environments ?? []),
      allowedGroups: protectedAllowedGroups,
    };

    this.db
      .prepare('UPDATE applications SET name = ?, route = ?, environments = ?, allowed_groups = ? WHERE id = ? AND area_id = ?')
      .run(updatedApplication.name, updatedApplication.route ?? '/dashboard', JSON.stringify(updatedApplication.environments), JSON.stringify(updatedApplication.allowedGroups), applicationId, areaId);

    return this.cloneApplication(updatedApplication);
  }

  removeArea(areaId: string): boolean {
    if (areaId === 'foundation') {
      return false;
    }

    const area = this.getArea(areaId);
    if (!area) {
      return false;
    }

    if (area.applications.some((application) => application.id === 'menu-admin')) {
      return false;
    }

    const result = this.db.prepare('DELETE FROM areas WHERE id = ?').run(areaId);
    return (result.changes ?? 0) > 0;
  }

  removeApplication(areaId: string, applicationId: string): boolean {
    if (areaId === 'foundation' && applicationId === 'menu-admin') {
      return false;
    }

    const area = this.getArea(areaId);
    if (!area) {
      return false;
    }

    const existing = area.applications.find((application) => application.id === applicationId);
    if (!existing) {
      return false;
    }

    if (existing.id === 'menu-admin') {
      return false;
    }

    const result = this.db.prepare('DELETE FROM applications WHERE id = ? AND area_id = ?').run(applicationId, areaId);
    return (result.changes ?? 0) > 0;
  }

  getAccessibleAreas(
    groups: Array<string | { codigo?: string; name?: string; id?: string; login?: string }> = [],
    environmentId?: string,
  ): MenuArea[] {
    const normalized = this.normalizeGroups(groups);
    const selectedEnvironment = this.normalizeEnvironment(environmentId ?? '');

    return this.getAllAreas()
      .map((area) => ({
        ...area,
        environments: [...(area.environments ?? [])],
        applications: area.applications.filter((application) => this.hasAccess(application, normalized, selectedEnvironment)),
      }))
      .filter((area) => area.applications.length > 0);
  }

  hasAccess(application: MenuApplication, groups: string[] = [], environmentId?: string): boolean {
    const selectedEnvironment = this.normalizeEnvironment(environmentId ?? '');
    const environmentAllowed =
      !application.environments || application.environments.length === 0 || application.environments.includes('*') ||
      application.environments.includes(selectedEnvironment);

    if (!environmentAllowed) {
      return false;
    }

    if (!application.allowedGroups || application.allowedGroups.length === 0) {
      return false;
    }

    return application.allowedGroups.some((group) => {
      const normalized = group.trim().toLowerCase();
      return normalized === '*' || groups.includes(normalized);
    });
  }

  private getArea(areaId: string): MenuArea | undefined {
    const area = this.db.prepare('SELECT * FROM areas WHERE id = ?').get(areaId) as { id: string; name: string; environments: string } | undefined;
    if (!area) {
      return undefined;
    }

    const applications = this.db
      .prepare('SELECT * FROM applications WHERE area_id = ? ORDER BY name COLLATE NOCASE')
      .all(area.id) as Array<{ id: string; name: string; route: string; environments: string; allowed_groups: string }>;

    return {
      id: area.id,
      name: area.name,
      environments: this.parseListFromDb(area.environments),
      applications: applications.map((application) => ({
        id: application.id,
        name: application.name,
        route: application.route,
        environments: this.parseListFromDb(application.environments),
        allowedGroups: this.parseListFromDb(application.allowed_groups),
      })),
    };
  }

  private seedDefaultAreas(): void {
    const rows = this.db.prepare('SELECT COUNT(*) as total FROM areas').get() as { total: number };
    if (rows.total > 0) {
      return;
    }

    DEFAULT_AREAS.forEach((area) => {
      this.createArea({
        ...area,
        applications: area.applications,
      });
    });
  }

  private ensureUniqueAreaId(id: string): string {
    const candidate = this.slugify(id || 'nova-area');
    let finalId = candidate;
    let suffix = 1;

    while (this.db.prepare('SELECT 1 FROM areas WHERE id = ?').get(finalId)) {
      finalId = `${candidate}-${suffix}`;
      suffix += 1;
    }

    return finalId;
  }

  private ensureUniqueApplicationId(areaId: string, id: string): string {
    const candidate = this.slugify(id || 'nova-aplicacao');
    let finalId = candidate;
    let suffix = 1;

    while (this.db.prepare('SELECT 1 FROM applications WHERE area_id = ? AND id = ?').get(areaId, finalId)) {
      finalId = `${candidate}-${suffix}`;
      suffix += 1;
    }

    return finalId;
  }

  private normalizeApplication(application: Partial<MenuApplication> = {}): MenuApplication {
    return {
      id: application.id ?? this.slugify(application.name ?? 'application'),
      name: application.name ?? 'Nova aplicação',
      route: application.route ?? '/dashboard',
      environments: this.normalizeEnvironments(application.environments ?? []),
      allowedGroups: this.normalizeGroups(application.allowedGroups ?? []),
    };
  }

  private normalizeGroups(groups: Array<string | { codigo?: string; name?: string; id?: string; login?: string }> = []): string[] {
    return groups
      .map((group) => {
        if (typeof group === 'string') {
          return group.trim().toLowerCase();
        }

        return group?.name ?? group?.codigo ?? group?.id ?? group?.login ?? '';
      })
      .filter((group) => !!group)
      .map((group) => group.trim().toLowerCase());
  }

  private ensureRequiredGroup(areaId: string, applicationId: string, groups: string[]): string[] {
    if (areaId === 'foundation' && applicationId === 'menu-admin') {
      const nextGroups = new Set(groups);
      nextGroups.add('sup');
      return ['sup', ...Array.from(nextGroups).filter((group) => group !== 'sup')];
    }

    return groups;
  }

  private normalizeEnvironments(environments: Array<string | { id?: string; label?: string }> = []): string[] {
    return environments
      .map((environment) => {
        if (typeof environment === 'string') {
          return environment.trim().toLowerCase();
        }

        return environment?.id ?? environment?.label ?? '';
      })
      .filter((environment) => !!environment)
      .map((environment) => environment.trim().toLowerCase());
  }

  private normalizeEnvironment(environment: string): string {
    return environment.trim().toLowerCase();
  }

  private parseListFromDb(value: string | undefined | null): string[] {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
      }
    } catch {
      return [];
    }

    return [];
  }

  private cloneArea(area: MenuArea): MenuArea {
    return {
      ...area,
      environments: [...(area.environments ?? [])],
      applications: area.applications.map((application) => this.cloneApplication(application)),
    };
  }

  private cloneApplication(application: MenuApplication): MenuApplication {
    return {
      ...application,
      environments: [...(application.environments ?? [])],
      allowedGroups: [...application.allowedGroups],
    };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  }
}
