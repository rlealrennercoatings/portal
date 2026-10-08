import { UnauthorizedException } from '@nestjs/common';

import { DatasulService } from '../datasul/datasul.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(new DatasulService());
  });

  it('should expose available Datasul environments', () => {
    const environments = service.getAvailableEnvironments();

    expect(environments.length).toBeGreaterThan(0);
    expect(environments.some((environment) => environment.id === 'chile-desenv')).toBe(true);
  });

  it('should authenticate a valid user', async () => {
    const result = await service.login('datasul', 'portal123', 'chile-desenv');

    expect(result.success).toBe(true);
    expect(result.user.login).toBe('datasul');
    expect(result.groups.length).toBeGreaterThan(0);
  });

  it('should reject invalid credentials', async () => {
    await expect(service.login('datasul', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
