import { UnauthorizedException } from '@nestjs/common';

import { DatasulService } from '../datasul/datasul.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(new DatasulService());
  });

  it('should authenticate a valid user', async () => {
    const result = await service.login('datasul', 'portal123');

    expect(result.success).toBe(true);
    expect(result.user.login).toBe('datasul');
    expect(result.groups.length).toBeGreaterThan(0);
  });

  it('should reject invalid credentials', async () => {
    await expect(service.login('datasul', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
