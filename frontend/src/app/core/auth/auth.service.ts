import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

export interface PortalUser {
  id: string;
  login: string;
  name: string;
  email: string;
  company: string;
  establishment: string;
}

export interface PortalGroup {
  id: string;
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'portal-user';
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<{ user: PortalUser; groups: PortalGroup[] }> {
    const normalizedUsername = username?.trim();
    const normalizedPassword = password?.trim();

    if (!normalizedUsername || !normalizedPassword) {
      return throwError(() => new Error('Usuário e senha são obrigatórios.'));
    }

    return this.http
      .post<{ success: boolean; user: PortalUser; groups: PortalGroup[] }>(
        'http://localhost:3000/api/auth/login',
        { username: normalizedUsername, password: normalizedPassword },
        { withCredentials: true }
      )
      .pipe(
        map((response) => {
          const user = response?.user ?? null;
          if (!user) {
            throw new Error('Resposta inválida do servidor.');
          }

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          return { user, groups: response.groups ?? [] };
        }),
        catchError((error) => {
          const message = error?.error?.message ?? 'Usuário ou senha inválidos.';
          return throwError(() => new Error(message));
        })
      );
  }

  hydrateSession(): Observable<PortalUser | null> {
    return this.http
      .get<{ authenticated: boolean; user?: PortalUser; groups?: PortalGroup[] }>('http://localhost:3000/api/auth/session', {
        withCredentials: true,
      })
      .pipe(
        map((session) => {
          const user = session?.authenticated ? session.user ?? null : null;
          if (user) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
            return user;
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

  getUserProfile(): Observable<{ user: PortalUser; groups: PortalGroup[] }> {
    return this.http
      .get<PortalUser>('http://localhost:3000/api/me', { withCredentials: true })
      .pipe(
        switchMap((user) =>
          this.http.get<PortalGroup[]>('http://localhost:3000/api/me/groups', { withCredentials: true }).pipe(
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
    this.http.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true }).subscribe();
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
