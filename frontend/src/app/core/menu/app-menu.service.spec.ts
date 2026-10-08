import { TestBed } from '@angular/core/testing';

import { AppMenuService } from './app-menu.service';

describe('AppMenuService', () => {
  let service: AppMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppMenuService);
  });

  it('should show only areas and applications visible to the current user groups', () => {
    const areas = service.getAccessibleAreas([{ name: 'sup' }, { name: 'w12' }]);

    expect(areas.map((area) => area.name)).toContain('Logística');
    expect(areas.map((area) => area.name)).toContain('Foundation');
    expect(areas.map((area) => area.name)).not.toContain('Recursos Humanos');

    const logistica = areas.find((area) => area.name === 'Logística');
    expect(logistica?.applications.map((application) => application.name)).toContain('Separação (Picking)');
    expect(logistica?.applications.map((application) => application.name)).toContain('Confirma saída transporte');
  });

  it('should hide applications with no matching group and honor wildcard access', () => {
    const areas = service.getAccessibleAreas([{ name: 'ti' }]);

    const tecnologia = areas.find((area) => area.name === 'Tecnologia');
    expect(tecnologia?.applications.map((application) => application.name)).toContain('Monitoramento');
    expect(areas.some((area) => area.name === 'Financeiro')).toBeFalse();
  });
});
