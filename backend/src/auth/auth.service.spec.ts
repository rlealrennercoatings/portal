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
    expect(environments.some((environment) => environment.id === 'cl-desenv')).toBe(true);
  });

  it('should authenticate a valid user', async () => {
    const result = await service.login('datasul', 'portal123', 'cl-desenv');

    expect(result.success).toBe(true);
    expect(result.user.login).toBe('datasul');
    expect(result.groups.length).toBeGreaterThan(0);
  });

  it('should map the Datasul grupos array into portal groups', async () => {
    const groups = [
      { codigo: 'SUP', descricao: 'Suporte' },
      { codigo: 'WCN', descricao: 'Warehouse' },
      { codigo: 'Y00', descricao: 'Administradores' },
    ];
    const originalFetch = global.fetch;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDemoFlag = process.env.DATASUL_USE_DEMO;

    process.env.NODE_ENV = 'development';
    delete process.env.DATASUL_USE_DEMO;

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({
        total: 1,
        hasNext: false,
        items: [{
          erro: 'NÃO',
          usuario: 'rleal',
          grupos: groups,
          email: 'leandrow@renner.com.br',
          nom_usuario: '813 - Roberto da Silveira Leal',
        }],
      }),
    } as any);

    try {
      const result = await service.login('rleal', 'senha', 'cl-desenv');

      expect(result.success).toBe(true);
      expect(result.groups.map((group) => group.name)).toEqual(['Suporte', 'Warehouse', 'Administradores']);
      expect(result.groups.map((group) => group.description)).toEqual(['Suporte', 'Warehouse', 'Administradores']);
      expect(result.user.name).toBe('813 - Roberto da Silveira Leal');
    } finally {
      global.fetch = originalFetch;
      process.env.NODE_ENV = originalNodeEnv;
      if (originalDemoFlag === undefined) {
        delete process.env.DATASUL_USE_DEMO;
      } else {
        process.env.DATASUL_USE_DEMO = originalDemoFlag;
      }
    }
  });

  it('should reject invalid credentials', async () => {
    await expect(service.login('datasul', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
