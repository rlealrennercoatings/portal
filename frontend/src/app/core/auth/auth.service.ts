import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface PortalUser {
  id: string;
  login: string;
  name: string;
  email: string;
  company: string;
  establishment: string;
  environment?: DatasulEnvironmentOption;
}

export interface PortalGroup {
  id: string;
  name: string;
  description: string;
}

export interface DatasulEnvironmentOption {
  id: string;
  label: string;
  country: string;
  stage: 'production' | 'homologacao' | 'desenvolvimento';
  baseUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'portal-user';
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiUrl;

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.apiBaseUrl.replace(/\/$/, '')}${normalizedPath}`;
  }

  login(
    username: string,
    password: string,
    environmentId?: string
  ): Observable<{ user: PortalUser; groups: PortalGroup[]; environment?: DatasulEnvironmentOption }> {
    const normalizedUsername = username?.trim();
    const normalizedPassword = password?.trim();

    if (!normalizedUsername || !normalizedPassword) {
      return throwError(() => new Error('Usuário e senha são obrigatórios.'));
    }

    return this.http
      .post<{ success: boolean; user: PortalUser; groups: PortalGroup[]; environment?: DatasulEnvironmentOption }>(
        this.buildUrl('/auth/login'),
        { username: normalizedUsername, password: normalizedPassword, environmentId },
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          const user = response?.user ?? null;
          if (!user) {
            throw new Error('Resposta inválida do servidor.');
          }

          const environment = response.environment ?? this.getEnvironmentFromId(environmentId);
          const userWithEnvironment = { ...user, environment };

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userWithEnvironment));
          return { user: userWithEnvironment, groups: response.groups ?? [], environment };
        }),
        catchError((error) => {
          const message = error?.error?.message ?? 'Usuário ou senha inválidos.';
          return throwError(() => new Error(message));
        })
      );
  }

  private getEnvironmentFromId(environmentId?: string): DatasulEnvironmentOption | undefined {
    if (!environmentId) {
      return undefined;
    }

    return this.getFallbackEnvironments().find((environment) => environment.id === environmentId);
  }

  private getFallbackEnvironments(): DatasulEnvironmentOption[] {
    return [
      { id: 'br-prod', label: 'Brasil - Produção', country: 'Brasil', stage: 'production', baseUrl: 'https://erp.renner.com.br' },
      { id: 'br-homolog', label: 'Brasil - Homologação', country: 'Brasil', stage: 'homologacao', baseUrl: 'https://erp-homol.renner.com.br' },
      { id: 'br-desenv', label: 'Brasil - Desenvolvimento', country: 'Brasil', stage: 'desenvolvimento', baseUrl: 'https://erp-desenv.renner.com.br' },
      { id: 'cl-prod', label: 'Chile - Produção', country: 'Chile', stage: 'production', baseUrl: 'https://erp-chile.renner.com.br' },
      { id: 'cl-homolog', label: 'Chile - Homologação', country: 'Chile', stage: 'homologacao', baseUrl: 'https://erp-chile-homol.renner.com.br' },
      { id: 'chile-desenv', label: 'Chile - Desenvolvimento', country: 'Chile', stage: 'desenvolvimento', baseUrl: 'https://erp-chile-desenv.renner.com.br' },
      { id: 'pe-prod', label: 'Peru - Produção', country: 'Peru', stage: 'production', baseUrl: 'https://erp-peru.renner.com.br' },
      { id: 'pe-homolog', label: 'Peru - Homologação', country: 'Peru', stage: 'homologacao', baseUrl: 'https://erp-peru-homol.renner.com.br' },
      { id: 'pe-desenv', label: 'Peru - Desenvolvimento', country: 'Peru', stage: 'desenvolvimento', baseUrl: 'https://erp-peru-desenv.renner.com.br' },
    ];
  }

  hydrateSession(): Observable<PortalUser | null> {
    return this.http
      .get<{ authenticated: boolean; user?: PortalUser; groups?: PortalGroup[]; environment?: DatasulEnvironmentOption }>(this.buildUrl('/auth/session'), {
        withCredentials: true,
      })
      .pipe(
        map((session) => {
          const user = session?.authenticated ? session.user ?? null : null;
          if (user) {
            const userWithEnvironment = { ...user, environment: session.environment ?? user.environment };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userWithEnvironment));
            return userWithEnvironment;
          }

          localStorage.removeItem(this.STORAGE_KEY);
          return null;
        }),
        catchError(() => {
          localStorage.removeItem(this.STORAGE_KEY);
          return of(null);
        })
      );
  }

  getAvailableEnvironments(): Observable<DatasulEnvironmentOption[]> {
    return this.http
      .get<DatasulEnvironmentOption[]>(this.buildUrl('/auth/environments'), { withCredentials: true })
      .pipe(
        catchError(() => of([]))
      );
  }

  getUserProfile(): Observable<{ user: PortalUser; groups: PortalGroup[] }> {
    return this.http
      .get<PortalUser>(this.buildUrl('/me'), { withCredentials: true })
      .pipe(
        switchMap((user) =>
          this.http.get<PortalGroup[]>(this.buildUrl('/me/groups'), { withCredentials: true }).pipe(
            map((groups) => ({ user, groups }))
          )
        ),
        catchError((error) => {
          const message = error?.error?.message ?? 'Não foi possível carregar o perfil.';
          return throwError(() => new Error(message));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.http.post(this.buildUrl('/auth/logout'), {}, { withCredentials: true }).subscribe();
  }

  getCurrentUser(): PortalUser | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as PortalUser;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}
