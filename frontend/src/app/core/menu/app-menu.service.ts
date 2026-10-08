import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

const APP_AREAS: MenuArea[] = [
  {
    id: 'financeiro',
    name: 'Financeiro',
    environments: ['*'],
    applications: [
      { id: 'controladoria', name: 'Controladoria', route: '/dashboard', environments: ['*'], allowedGroups: ['*'] },
      { id: 'fluxo-caixa', name: 'Fluxo de caixa', route: '/dashboard', environments: ['br-prod', 'br-homolog'], allowedGroups: ['sup', 'fin'] }
    ]
  },
  {
    id: 'logistica',
    name: 'Logística',
    environments: ['*'],
    applications: [
      { id: 'separacao-picking', name: 'Separação (Picking)', route: '/apps/separacao-picking', environments: ['br-prod', 'br-homolog', 'cl-prod'], allowedGroups: ['sup', 'w12'] },
      { id: 'confirma-saida-transporte', name: 'Confirma saída transporte', route: '/apps/confirma-saida-transporte', environments: ['*'], allowedGroups: ['*'] }
    ]
  },
  {
    id: 'manufatura',
    name: 'Manufatura',
    environments: ['br-prod'],
    applications: [
      { id: 'planejamento-producao', name: 'Planejamento de produção', route: '/dashboard', environments: ['br-prod'], allowedGroups: ['sup', 'manufatura'] }
    ]
  },
  {
    id: 'recursos-humanos',
    name: 'Recursos Humanos',
    environments: ['br-prod'],
    applications: [
      { id: 'folha-ponto', name: 'Folha e ponto', route: '/dashboard', environments: ['br-prod'], allowedGroups: ['sup', 'rh'] }
    ]
  },
  {
    id: 'foundation',
    name: 'Foundation',
    environments: ['*'],
    applications: [
      { id: 'gestao-acesso', name: 'Gestão de acessos', route: '/dashboard', environments: ['*'], allowedGroups: ['sup'] },
      { id: 'usuarios-permissoes', name: 'Usuários e permissões', route: '/dashboard', environments: ['*'], allowedGroups: ['sup', 'foundation'] },
      { id: 'menu-admin', name: 'Administração do menu', route: '/menu-admin', environments: ['*'], allowedGroups: ['sup'] }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    environments: ['*'],
    applications: [
      { id: 'monitoramento', name: 'Monitoramento', route: '/dashboard', environments: ['*'], allowedGroups: ['sup', 'ti'] },
      { id: 'integracoes', name: 'Integrações', route: '/dashboard', environments: ['*'], allowedGroups: ['sup', 'tecnologia'] }
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class AppMenuService {
  private readonly http = inject(HttpClient);

  loadAccessibleAreas(): Observable<MenuArea[]> {
    return this.http.get<MenuArea[]>('http://localhost:3000/api/menu/areas', { withCredentials: true }).pipe(
      catchError(() => of(this.getAccessibleAreas()))
    );
  }

  getAccessibleAreas(userGroups: Array<string | { name?: string; codigo?: string; id?: string; login?: string }> = [], environmentId?: string): MenuArea[] {
    const normalizedGroups = this.normalizeGroups(userGroups);
    const selectedEnvironment = this.normalizeEnvironment(environmentId ?? '');

    return APP_AREAS.map((area) => ({
      ...area,
      environments: [...(area.environments ?? [])],
      applications: area.applications.filter((application) => this.hasAccess(application, normalizedGroups, selectedEnvironment))
    })).filter((area) => area.applications.length > 0);
  }

  hasAccess(application: MenuApplication, userGroups: string[] = [], environmentId?: string): boolean {
    const normalizedGroups = this.normalizeGroups(userGroups);
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
      const normalizedGroup = group.trim().toLowerCase();
      return normalizedGroup === '*' || normalizedGroups.includes(normalizedGroup);
    });
  }

  private normalizeGroups(groups: Array<string | { name?: string; codigo?: string; id?: string; login?: string }> = []): string[] {
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

  private normalizeEnvironment(environmentId: string): string {
    return (environmentId ?? '').trim().toLowerCase();
  }
}
