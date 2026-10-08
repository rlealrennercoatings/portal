import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should persist groups returned by the login API in the current session', () => {
    const groups = [
      { id: 'grp-ti', name: 'TI', description: 'Suporte e manutenção' },
      { id: 'grp-comercial', name: 'Comercial', description: 'Área comercial' },
    ];

    service.login('datasul', 'portal123', 'chile-desenv').subscribe((response) => {
      expect(response.groups).toEqual(groups);
      expect(service.getCurrentUser()?.groups).toEqual(groups);
    });

    const request = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(request.request.method).toBe('POST');

    request.flush({
      success: true,
      user: {
        id: 'usr-1',
        login: 'datasul',
        name: 'Administrador Datasul',
        email: 'admin@datasul.local',
        company: 'Renner',
        establishment: 'Matriz',
      },
      groups,
      environment: {
        id: 'chile-desenv',
        label: 'Chile - Desenvolvimento',
        country: 'Chile',
        stage: 'desenvolvimento',
        baseUrl: 'https://erp-chile-desenv.renner.com.br',
      },
    });
  });

  it('should remember the last environment selected by the user', () => {
    service.setLastSelectedEnvironmentId('br-prod');

    expect(service.getLastSelectedEnvironmentId()).toBe('br-prod');
    expect(localStorage.getItem('portal-last-environment')).toBe('br-prod');
  });
});
