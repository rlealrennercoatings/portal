import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    service = new MenuService();
  });

  afterEach(() => {
    service.close();
  });

  it('should keep only areas with at least one application allowed for the user groups', () => {
    const areas = service.getAccessibleAreas(['sup']);

    expect(areas.some((area) => area.id === 'logistica')).toBe(true);
    expect(areas.some((area) => area.id === 'financeiro')).toBe(true);
    expect(areas.some((area) => area.id === 'tecnologia')).toBe(true);
  });

  it('should allow creating a new dynamic area and application', () => {
    const created = service.createArea({
      id: 'comercial',
      name: 'Comercial',
      applications: [
        {
          id: 'clientes',
          name: 'Clientes',
          route: '/dashboard',
          allowedGroups: ['comercial'],
        },
      ],
    });

    expect(created.id).toBe('comercial');
    expect(service.getAllAreas().some((area) => area.id === 'comercial')).toBe(true);
    expect(service.getAccessibleAreas(['comercial']).some((area) => area.id === 'comercial')).toBe(true);
  });

  it('should update an existing application allowed groups', () => {
    const area = service.getAllAreas().find((item) => item.id === 'logistica');
    expect(area).toBeTruthy();

    const updated = service.updateApplication('logistica', 'separacao-picking', { allowedGroups: ['w12'] });

    expect(updated?.allowedGroups).toEqual(['w12']);
    expect(service.hasAccess({ id: 'x', name: 'x', route: '/x', allowedGroups: ['w12'] }, ['w12'])).toBe(true);
  });

  it('should enforce environment and datasul group access together', () => {
    service.createArea({
      id: 'rh',
      name: 'Recursos Humanos',
      environments: ['br-prod'],
      applications: [
        {
          id: 'folha',
          name: 'Folha de pagamento',
          route: '/dashboard',
          environments: ['br-prod'],
          allowedGroups: ['rh'],
        },
      ],
    });

    expect(service.getAccessibleAreas(['rh'], 'br-prod').some((area) => area.id === 'rh')).toBe(true);
    expect(service.getAccessibleAreas(['rh'], 'cl-prod').some((area) => area.id === 'rh')).toBe(false);
    expect(service.getAccessibleAreas(['fin'], 'br-prod').some((area) => area.id === 'rh')).toBe(false);
  });

  it('should expose the menu administration only to the SUP group inside Foundation', () => {
    const foundation = service.getAllAreas().find((area) => area.id === 'foundation');
    const menuAdminApplication = foundation?.applications.find((application) => application.id === 'menu-admin');

    expect(menuAdminApplication).toBeDefined();
    expect(menuAdminApplication?.allowedGroups).toContain('sup');
    expect(service.getAccessibleAreas(['sup']).some((area) => area.id === 'foundation')).toBe(true);
    expect(service.getAccessibleAreas(['fin']).some((area) => area.id === 'foundation')).toBe(false);
  });

  it('should keep the SUP group always enabled for the menu administration application', () => {
    const updated = service.updateApplication('foundation', 'menu-admin', { allowedGroups: ['fin'] });

    expect(updated?.allowedGroups).toContain('sup');
    expect(updated?.allowedGroups).toEqual(['sup', 'fin']);
  });

  it('should prevent deleting the menu administration application and the Foundation area', () => {
    expect(service.removeApplication('foundation', 'menu-admin')).toBe(false);
    expect(service.removeArea('foundation')).toBe(false);
  });

  it('should keep environment rules on applications and ignore area-level environments', () => {
    const created = service.createArea({
      id: 'vendas',
      name: 'Vendas',
      environments: ['br-prod'],
      applications: [{
        id: 'pedidos',
        name: 'Pedidos',
        route: '/dashboard',
        environments: ['br-prod'],
        allowedGroups: ['sup'],
      }],
    });

    expect(created.environments).toEqual([]);
    expect(service.getAccessibleAreas(['sup'], 'br-prod').some((area) => area.id === 'vendas')).toBe(true);
  });
});
