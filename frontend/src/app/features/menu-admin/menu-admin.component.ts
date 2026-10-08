import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';

interface MenuApplication {
  id: string;
  name: string;
  route?: string;
  environments?: string[];
  allowedGroups: string[];
}

interface MenuArea {
  id: string;
  name: string;
  environments?: string[];
  applications: MenuApplication[];
}

interface ApplicationDraft {
  name: string;
  route: string;
  environments: string;
  groups: string;
}

interface AccessDraft {
  groups: string;
  environments: string;
}

interface AreaEditDraft {
  name: string;
}

@Component({
  selector: 'app-menu-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Configuração</p>
          <h1>Administração do menu</h1>
        </div>
      </header>

      <div class="help-card">
        <h2>Como funciona</h2>
        <ol>
          <li>Crie uma área, como Financeiro, Logística ou Foundation.</li>
          <li>Adicione uma aplicação dentro da área e informe a rota da página.</li>
          <li>Defina os ambientes e os grupos Datasul que podem visualizar essa aplicação.</li>
        </ol>
        <p><strong>Exemplo:</strong> br-prod, br-homolog | sup, w12</p>
      </div>

      <form class="panel-form" (ngSubmit)="createArea()">
        <div class="form-title-row">
          <h2>Nova área</h2>
        </div>
        <div class="field-grid single-column">
          <label>
            <span>Nome da área</span>
            <input type="text" [(ngModel)]="newAreaName" name="newAreaName" placeholder="Ex.: Comercial" />
          </label>
        </div>

        <button type="submit" class="primary-button">Adicionar área</button>
      </form>

      <div class="areas" *ngIf="areas.length; else emptyState">
        <article class="area-card" *ngFor="let area of areas">
          <div class="area-header">
            <div class="area-header-main">
              <h2>{{ area.name }}</h2>
              <span class="area-pill">{{ area.applications.length }} aplicações</span>
            </div>

            <div class="area-actions">
              <label>
                <span>Nome da área</span>
                <input type="text" [(ngModel)]="editAreaDrafts[area.id].name" [name]="'area-name-' + area.id" />
              </label>

              <div class="button-group">
                <button type="button" class="save-button" (click)="saveArea(area.id)">Salvar área</button>
                <button type="button" class="danger-button" (click)="deleteArea(area.id)" [disabled]="area.id === 'foundation'">Excluir área</button>
              </div>
            </div>
          </div>

          <form class="application-form" (ngSubmit)="createApplication(area.id)">
            <div class="field-grid compact-grid">
              <label>
                <span>Nova aplicação</span>
                <input type="text" [(ngModel)]="newApplicationDraft[area.id].name" [name]="'app-name-' + area.id" placeholder="Ex.: Clientes" />
              </label>

              <label>
                <span>Rota</span>
                <input type="text" [(ngModel)]="newApplicationDraft[area.id].route" [name]="'app-route-' + area.id" placeholder="/dashboard" />
              </label>

              <label class="checkbox-dropdown-field">
                <span>Ambientes</span>
                <div class="checkbox-dropdown">
                  <button type="button" class="dropdown-trigger" (click)="$event.preventDefault(); toggleEnvironmentMenu(area.id, 'new')">
                    {{ getEnvironmentLabel(newApplicationDraft[area.id].environments) }}
                  </button>
                  <div class="dropdown-menu" *ngIf="environmentMenus[area.id]?.['new']">
                    <label *ngFor="let environment of environmentOptions" class="check-item">
                      <input type="checkbox" [checked]="isEnvironmentSelected(newApplicationDraft[area.id].environments, environment.id)" (change)="toggleEnvironment(area.id, 'new', environment.id)" />
                      <span>{{ environment.label }}</span>
                    </label>
                  </div>
                </div>
              </label>

              <label>
                <span>Grupos Datasul</span>
                <input type="text" [(ngModel)]="newApplicationDraft[area.id].groups" [name]="'app-groups-' + area.id" placeholder="sup, w12" />
              </label>
            </div>

            <button type="submit" class="secondary-button">Adicionar aplicação</button>
          </form>

          <div class="application-list" *ngIf="area.applications.length; else noApplications">
            <div class="application-row" *ngFor="let application of area.applications">
              <div class="application-meta">
                <strong>{{ application.name }}</strong>
                <small>{{ application.route ?? '/dashboard' }}</small>
                <small>Ambientes: {{ application.environments?.join(', ') || '*' }}</small>
              </div>

              <div class="application-editor">
                <div class="app-edit-grid">
                  <label>
                    <span>Nome</span>
                    <input type="text" [(ngModel)]="applicationDrafts[area.id][application.id].name" [name]="'app-edit-name-' + area.id + '-' + application.id" />
                  </label>

                  <label>
                    <span>Rota</span>
                    <input type="text" [(ngModel)]="applicationDrafts[area.id][application.id].route" [name]="'app-edit-route-' + area.id + '-' + application.id" />
                  </label>
                </div>

                <div class="access-editor">
                  <label>
                    <span>Grupos permitidos</span>
                    <input type="text" [(ngModel)]="accessDrafts[area.id][application.id].groups" [name]="'groups-' + area.id + '-' + application.id" />
                  </label>

                  <label class="checkbox-dropdown-field">
                    <span>Ambientes</span>
                    <div class="checkbox-dropdown">
                      <button type="button" class="dropdown-trigger" (click)="$event.preventDefault(); toggleEnvironmentMenu(area.id, application.id)">
                        {{ getEnvironmentLabel(accessDrafts[area.id][application.id].environments) }}
                      </button>
                      <div class="dropdown-menu" *ngIf="environmentMenus[area.id]?.[application.id]">
                        <label *ngFor="let environment of environmentOptions" class="check-item">
                          <input type="checkbox" [checked]="isEnvironmentSelected(accessDrafts[area.id][application.id].environments, environment.id)" (change)="toggleEnvironment(area.id, application.id, environment.id)" />
                          <span>{{ environment.label }}</span>
                        </label>
                      </div>
                    </div>
                  </label>

                  <div class="button-group small-gap">
                    <button type="button" class="save-button" (click)="saveApplication(area.id, application.id)">Salvar app</button>
                    <button type="button" class="danger-button" (click)="deleteApplication(area.id, application.id)" [disabled]="application.id === 'menu-admin'">Excluir</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noApplications>
            <p class="empty-state">Ainda não há aplicações nesta área.</p>
          </ng-template>
        </article>
      </div>

      <ng-template #emptyState>
        <div class="empty-state-card">
          <p>Nenhuma área cadastrada no momento.</p>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .page-shell { padding: 32px; display: grid; gap: 22px; }
      .page-header h1 { margin: 6px 0 0; color: var(--renner-red-900); }
      .eyebrow { margin: 0; text-transform: uppercase; letter-spacing: .08em; color: var(--renner-red-700); font-size: 12px; font-weight: 700; }
      .help-card, .panel-form, .area-card { background: #fff; border: 1px solid #f0d6d8; border-radius: 18px; padding: 20px; box-shadow: 0 12px 28px rgba(120, 23, 31, 0.06); }
      .help-card h2, .panel-form h2, .area-header h2 { margin: 0; color: var(--renner-red-900); }
      .help-card ol { margin: 12px 0 14px 18px; color: #4f4446; line-height: 1.6; }
      .help-card p { margin: 0; color: #4f4446; }
      .panel-form { display: grid; gap: 16px; }
      .form-title-row { display: flex; justify-content: space-between; align-items: center; }
      .field-grid { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 16px; }
      .single-column { grid-template-columns: minmax(220px, 1fr); }
      .compact-grid { grid-template-columns: repeat(4, minmax(180px, 1fr)); }
      label { display: grid; gap: 8px; color: var(--renner-red-900); font-weight: 600; }
      input { width: 100%; border: 1px solid #e5b7bc; border-radius: 10px; padding: 11px 12px; font-size: 0.95rem; background: #fff; color: #2d1d20; box-sizing: border-box; }
      input:focus { outline: 2px solid rgba(152, 23, 35, 0.15); border-color: var(--renner-red-700); }
      .checkbox-dropdown-field { position: relative; }
      .checkbox-dropdown { position: relative; }
      .dropdown-trigger { width: 100%; background: #fff; border: 1px solid #e5b7bc; border-radius: 10px; padding: 11px 12px; text-align: left; color: #2d1d20; font-weight: 600; }
      .dropdown-menu { position: absolute; z-index: 2; top: calc(100% + 6px); left: 0; right: 0; background: #fff; border: 1px solid #e5b7bc; border-radius: 10px; box-shadow: 0 12px 24px rgba(120, 23, 31, 0.08); padding: 8px; display: grid; gap: 6px; }
      .check-item { display: flex; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 8px; background: #fff7f7; }
      .check-item input { width: auto; }
      button { border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: transform .15s ease, opacity .15s ease; }
      button:hover { transform: translateY(-1px); }
      button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      .primary-button, .secondary-button, .save-button, .danger-button { padding: 11px 16px; }
      .primary-button, .save-button { background: var(--renner-red-700); color: #fff; }
      .secondary-button { background: #fbe9eb; color: var(--renner-red-900); }
      .danger-button { background: #7a1d1d; color: #fff; }
      .areas { display: grid; gap: 18px; }
      .area-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
      .area-header-main { display: flex; align-items: center; gap: 12px; }
      .area-pill { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; background: #f9e8ea; color: var(--renner-red-900); font-size: 12px; font-weight: 700; }
      .area-actions { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; }
      .button-group { display: flex; gap: 10px; align-items: flex-end; }
      .small-gap { gap: 8px; }
      .application-form { display: grid; gap: 14px; padding-bottom: 18px; border-bottom: 1px solid #f2e0e0; margin-bottom: 18px; }
      .application-list { display: grid; gap: 14px; }
      .application-row { display: grid; grid-template-columns: minmax(200px, 1fr) minmax(380px, 1.5fr); gap: 18px; align-items: end; padding: 16px; border: 1px solid #f1dfe1; border-radius: 12px; background: #fffaf9; }
      .application-meta { display: grid; gap: 6px; }
      .application-meta strong { color: var(--renner-red-900); }
      .application-meta small { color: #5d4c4d; }
      .application-editor { display: grid; gap: 12px; }
      .app-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .access-editor { display: grid; grid-template-columns: 1fr 1fr auto; gap: 12px; align-items: end; }
      .save-button { align-self: end; }
      .empty-state, .empty-state-card { color: #6b5a5c; padding: 20px; background: #fff; border-radius: 12px; border: 1px dashed #e7c6ca; }
      .empty-state-card { text-align: center; }
      @media (max-width: 900px) {
        .field-grid, .compact-grid, .application-row, .access-editor, .area-actions, .app-edit-grid { grid-template-columns: 1fr; }
        .button-group { flex-direction: column; align-items: stretch; }
        .page-shell { padding: 20px 16px; }
      }
    `
  ]
})
export class MenuAdminComponent implements OnInit {
  areas: MenuArea[] = [];
  newAreaName = '';
  newApplicationDraft: Record<string, ApplicationDraft> = {};
  accessDrafts: Record<string, Record<string, AccessDraft>> = {};
  applicationDrafts: Record<string, Record<string, { name: string; route: string; environments: string; groups: string }>> = {};
  editAreaDrafts: Record<string, AreaEditDraft> = {};
  environmentOptions: Array<{ id: string; label: string }> = [
    { id: '*', label: 'Todos os ambientes' },
    { id: 'cl-desenv', label: 'Chile - Desenvolvimento' },
    { id: 'br-desenv', label: 'Brasil - Desenvolvimento' },
    { id: 'pe-desenv', label: 'Peru - Desenvolvimento' },
    { id: 'br-homolog', label: 'Brasil - Homologação' },
    { id: 'cl-homolog', label: 'Chile - Homologação' },
    { id: 'pe-homolog', label: 'Peru - Homologação' },
    { id: 'br-prod', label: 'Brasil - Produção' },
    { id: 'cl-prod', label: 'Chile - Produção' },
    { id: 'pe-prod', label: 'Peru - Produção' },
  ];
  environmentMenus: Record<string, Record<string, boolean>> = {};

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.loadAvailableEnvironments();
    this.loadAreas();
  }

  private loadAvailableEnvironments(): void {
    this.authService.getAvailableEnvironments().subscribe((environments) => {
      const normalized = environments.length > 0
        ? environments.map((environment) => ({ id: environment.id, label: environment.label }))
        : this.environmentOptions;
      this.environmentOptions = normalized;
    });
  }

  loadAreas(): void {
    this.http.get<MenuArea[]>('/api/menu/catalog', { withCredentials: true }).subscribe({
      next: (areas) => {
        this.areas = areas;
        this.syncDrafts();
      },
      error: () => {
        this.areas = [];
      }
    });
  }

  createArea(): void {
    const name = this.newAreaName.trim();
    if (!name) {
      return;
    }

    const area = {
      name,
      applications: [],
    };

    this.http.post<MenuArea>('/api/menu/areas', area, { withCredentials: true }).subscribe(() => {
      this.newAreaName = '';
      this.loadAreas();
    });
  }

  createApplication(areaId: string): void {
    const draft = this.newApplicationDraft[areaId] ?? { name: '', route: '/dashboard', environments: '', groups: '' };
    const name = draft.name.trim();

    if (!name) {
      return;
    }

    const app = {
      name,
      route: draft.route.trim() || '/dashboard',
      environments: this.parseList(draft.environments),
      allowedGroups: this.parseList(draft.groups),
    };

    this.http
      .post<MenuArea>(`/api/menu/areas/${areaId}/applications`, app, { withCredentials: true })
      .subscribe(() => {
        this.newApplicationDraft[areaId] = { name: '', route: '/dashboard', environments: '', groups: '' };
        this.loadAreas();
      });
  }

  saveArea(areaId: string): void {
    const area = this.areas.find((item) => item.id === areaId);
    if (!area) {
      return;
    }

    const draft = this.editAreaDrafts[areaId];
    if (!draft) {
      return;
    }

    const payload: Partial<MenuArea> = {
      name: draft.name.trim() || area.name,
    };

    this.http.patch<MenuArea>(`/api/menu/areas/${areaId}`, payload, { withCredentials: true }).subscribe(() => this.loadAreas());
  }

  deleteArea(areaId: string): void {
    if (areaId === 'foundation') {
      return;
    }

    this.http.delete<{ success: boolean }>(`/api/menu/areas/${areaId}`, { withCredentials: true }).subscribe(({ success }) => {
      if (success) {
        this.loadAreas();
      }
    });
  }

  saveApplication(areaId: string, applicationId: string): void {
    const draft = this.accessDrafts[areaId]?.[applicationId];
    const appDraft = this.applicationDrafts[areaId]?.[applicationId];
    if (!draft || !appDraft) {
      return;
    }

    const allowedGroups = this.parseList(draft.groups);
    const protectedAllowedGroups = areaId === 'foundation' && applicationId === 'menu-admin'
      ? ['sup', ...allowedGroups.filter((group) => group !== 'sup')]
      : allowedGroups;

    const payload: Partial<MenuApplication> = {
      name: appDraft.name.trim() || appDraft.name,
      route: appDraft.route.trim() || '/dashboard',
      allowedGroups: protectedAllowedGroups,
      environments: this.parseList(draft.environments),
    };

    this.http
      .patch<MenuApplication>(`/api/menu/areas/${areaId}/applications/${applicationId}`, payload, { withCredentials: true })
      .subscribe(() => this.loadAreas());
  }

  deleteApplication(areaId: string, applicationId: string): void {
    if (applicationId === 'menu-admin') {
      return;
    }

    this.http
      .delete<{ success: boolean }>(`/api/menu/areas/${areaId}/applications/${applicationId}`, { withCredentials: true })
      .subscribe(({ success }) => {
        if (success) {
          this.loadAreas();
        }
      });
  }

  toggleEnvironmentMenu(areaId: string, applicationId: string): void {
    this.environmentMenus[areaId] ??= {};
    this.environmentMenus[areaId][applicationId] = !this.environmentMenus[areaId][applicationId];
  }

  isEnvironmentSelected(value: string, environment: string): boolean {
    const selected = this.parseList(value);
    if (selected.includes('*')) {
      return true;
    }

    return selected.includes(environment);
  }

  getEnvironmentLabel(value: string): string {
    const selected = this.parseList(value);
    if (!selected.length) {
      return 'Selecione os ambientes';
    }

    if (selected.includes('*')) {
      return 'Todos os ambientes';
    }

    return selected
      .map((environmentId) => this.environmentOptions.find((environment) => environment.id === environmentId)?.label ?? environmentId)
      .join(', ');
  }

  toggleEnvironment(areaId: string, applicationId: string, environment: string): void {
    const currentValue = applicationId === 'new' ? this.newApplicationDraft[areaId]?.environments ?? '' : this.accessDrafts[areaId]?.[applicationId]?.environments ?? '';
    const selected = this.parseList(currentValue);

    if (environment === '*') {
      const next = selected.includes('*') ? [] : ['*'];
      const serialized = next.join(', ');

      if (applicationId === 'new') {
        this.newApplicationDraft[areaId] ??= { name: '', route: '/dashboard', environments: '', groups: '' };
        this.newApplicationDraft[areaId].environments = serialized;
        return;
      }

      this.accessDrafts[areaId] ??= {};
      this.accessDrafts[areaId][applicationId] ??= { groups: '', environments: '' };
      this.accessDrafts[areaId][applicationId].environments = serialized;
      return;
    }

    const withoutWildcard = selected.filter((item) => item !== '*');
    const next = withoutWildcard.includes(environment)
      ? withoutWildcard.filter((item) => item !== environment)
      : [...withoutWildcard, environment];

    const serialized = next.join(', ');

    if (applicationId === 'new') {
      this.newApplicationDraft[areaId] ??= { name: '', route: '/dashboard', environments: '', groups: '' };
      this.newApplicationDraft[areaId].environments = serialized;
      return;
    }

    this.accessDrafts[areaId] ??= {};
    this.accessDrafts[areaId][applicationId] ??= { groups: '', environments: '' };
    this.accessDrafts[areaId][applicationId].environments = serialized;
  }

  private syncDrafts(): void {
    this.areas.forEach((area) => {
      this.newApplicationDraft[area.id] ??= { name: '', route: '/dashboard', environments: '', groups: '' };
      this.accessDrafts[area.id] ??= {};
      this.applicationDrafts[area.id] ??= {};
      this.environmentMenus[area.id] ??= {};
      this.editAreaDrafts[area.id] ??= {
        name: area.name,
      };

      this.editAreaDrafts[area.id].name = this.editAreaDrafts[area.id].name || area.name;

      area.applications.forEach((application) => {
        this.accessDrafts[area.id][application.id] ??= {
          groups: application.allowedGroups?.join(', ') ?? '',
          environments: application.environments?.join(', ') ?? '*',
        };

        this.applicationDrafts[area.id][application.id] ??= {
          name: application.name,
          route: application.route ?? '/dashboard',
          environments: application.environments?.join(', ') ?? '*',
          groups: application.allowedGroups?.join(', ') ?? '',
        };
      });
    });
  }

  private parseList(value: string): string[] {
    const normalized = (value ?? '').trim();
    if (!normalized) {
      return [];
    }

    const items = normalized
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    return items.includes('*') ? ['*'] : items;
  }
}
