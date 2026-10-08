import { Injectable, UnauthorizedException } from '@nestjs/common';

import { DatasulService } from '../datasul/datasul.service';

@Injectable()
export class AuthService {
  constructor(private readonly datasulService: DatasulService) {}

  async login(username: string, password: string, domain?: string, environmentId?: string) {
    try {
      const result = await this.datasulService.authenticate(username, password, domain, environmentId);
      const environment = this.datasulService.getSessionEnvironment(result.sessionId);

      return {
        success: true,
        sessionId: result.sessionId,
        user: result.user,
        groups: result.groups,
        environment,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Não foi possível autenticar o usuário.');
    }
  }

  getSession(sessionId?: string) {
    const user = this.datasulService.getUserBySession(sessionId);
    const groups = this.datasulService.getGroupsBySession(sessionId);
    const environment = this.datasulService.getSessionEnvironment(sessionId);

    if (!user) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user,
      groups,
      environment,
    };
  }

  logout(sessionId?: string) {
    this.datasulService.clearSession(sessionId);
    return { success: true, message: 'Logout realizado com sucesso.' };
  }

  getAvailableEnvironments() {
    return this.datasulService.getAvailableEnvironments();
  }
}
