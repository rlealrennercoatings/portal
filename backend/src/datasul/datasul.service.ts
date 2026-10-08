import { randomUUID } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';

interface DatasulSession {
  login: string;
  user: {
    id: string;
    login: string;
    name: string;
    email: string;
    company: string;
    establishment: string;
  };
  groups: Array<{ id: string; name: string; description: string }>;
  createdAt: Date;
}

@Injectable()
export class DatasulService {
  private readonly sessions = new Map<string, DatasulSession>();

  private readonly loginUrl =
    process.env.DATASUL_LOGIN_URL ?? 'https://erp-chile-desenv.renner.com.br/totvs-login/ACS?login';

  private readonly restLoginUrl =
    process.env.DATASUL_REST_LOGIN_URL ??
    'https://erp-chile-desenv.renner.com.br/api/rest/sec/v1/login-api/login';

  private readonly restLoginPathTemplate =
    process.env.DATASUL_REST_LOGIN_PATH_TEMPLATE ??
    '/api/rest/sec/v1/login-api/login';

  private readonly invalidCredentialsRegex = /Usuário ou senha inválidos|bloqueado|sem empresa associada|inexistente/i;

  private buildBasicAuthHeader(username: string, password: string) {
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  private readonly defaultGroups = [
    { id: 'grp-admin', name: 'Administradores', description: 'Acesso total ao portal' },
    { id: 'grp-comercial', name: 'Comercial', description: 'Área comercial' },
    { id: 'grp-ti', name: 'TI', description: 'Suporte e manutenção' },
  ];

  async authenticate(login: string, password: string, domain?: string) {
    if (!login || !password) {
      throw new UnauthorizedException('Usuário e senha são obrigatórios.');
    }

    const normalizedLogin = login.trim();

    if (process.env.NODE_ENV === 'test' || process.env.DATASUL_USE_DEMO === 'true') {
      if (normalizedLogin.toLowerCase() !== 'datasul' || password !== 'portal123') {
        throw new UnauthorizedException('Usuário ou senha inválidos.');
      }

      const user = {
        id: 'usr-1001',
        login: normalizedLogin,
        name: 'Administrador Datasul',
        email: 'admin@datasul.local',
        company: 'Renner Coatings',
        establishment: 'Matriz',
      };

      const sessionId = randomUUID();
      this.sessions.set(sessionId, {
        login: normalizedLogin,
        user,
        groups: this.defaultGroups,
        createdAt: new Date(),
      });

      return { user, groups: this.defaultGroups, sessionId };
    }

    try {
      const encodedUser = encodeURIComponent(normalizedLogin);
      const encodedPassword = encodeURIComponent(password);
      const loginUrlWithPathParams = `${this.restLoginUrl},${encodedUser},${encodedPassword}`;

      const response = await fetch(loginUrlWithPathParams, {
        method: 'GET',
        headers: {
          Authorization: this.buildBasicAuthHeader(normalizedLogin, password),
          Accept: 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
      });

      const responseText = await response.text();
      const payload = responseText.trim().startsWith('{') || responseText.trim().startsWith('[')
        ? JSON.parse(responseText)
        : null;
      const responseItems = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

      const authResult = responseItems.find(
        (item: Record<string, unknown> | null) => item && typeof item === 'object' && 'erro' in item,
      ) as Record<string, unknown> | undefined;

      const hasAuthError =
        response.status >= 400 ||
        String(authResult?.erro ?? '').trim().toUpperCase() === 'SIM';

      if (hasAuthError) {
        throw new UnauthorizedException(
          String(authResult?.nom_usuario ?? 'Usuário ou senha inválidos.'),
        );
      }

      const user = {
        id: normalizedLogin,
        login: normalizedLogin,
        name: String(authResult?.nom_usuario ?? normalizedLogin),
        email: `${normalizedLogin}@datasul.local`,
        company: 'UNKNOWN',
        establishment: 'UNKNOWN',
      };

      const sessionId = randomUUID();
      this.sessions.set(sessionId, {
        login: normalizedLogin,
        user,
        groups: this.defaultGroups,
        createdAt: new Date(),
      });

      return {
        user,
        groups: this.defaultGroups,
        sessionId,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const payload = new URLSearchParams({
        j_username: normalizedLogin,
        j_password: password,
        j_use_domain: domain ? 'true' : 'false',
        j_one_domain: domain ?? '',
        j_domain: domain ?? '',
      });

      const response = await fetch(this.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
        body: payload.toString(),
        redirect: 'manual',
      });

      const bodyText = await response.text();

      if (
        response.status === 401 ||
        response.status === 403 ||
        this.invalidCredentialsRegex.test(bodyText)
      ) {
        throw new UnauthorizedException('Usuário ou senha inválidos.');
      }

      const user = {
        id: normalizedLogin,
        login: normalizedLogin,
        name: normalizedLogin,
        email: `${normalizedLogin}@datasul.local`,
        company: 'UNKNOWN',
        establishment: 'UNKNOWN',
      };

      const sessionId = randomUUID();
      this.sessions.set(sessionId, {
        login: normalizedLogin,
        user,
        groups: this.defaultGroups,
        createdAt: new Date(),
      });

      return {
        user,
        groups: this.defaultGroups,
        sessionId,
      };
    }
  }

  getUser() {
    return {
      id: 'usr-1001',
      login: 'datasul',
      name: 'Administrador Datasul',
      email: 'admin@datasul.local',
      company: 'Renner Coatings',
      establishment: 'Matriz',
    };
  }

  getGroups() {
    return this.defaultGroups;
  }

  getUserBySession(sessionId?: string) {
    if (!sessionId) {
      return null;
    }

    return this.sessions.get(sessionId)?.user ?? null;
  }

  getGroupsBySession(sessionId?: string) {
    if (!sessionId) {
      return [];
    }

    return this.sessions.get(sessionId)?.groups ?? [];
  }

  clearSession(sessionId?: string) {
    if (!sessionId) {
      return;
    }

    this.sessions.delete(sessionId);
  }
}
