import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { MenuAdminComponent } from './menu-admin.component';

describe('MenuAdminComponent', () => {
  let component: MenuAdminComponent;
  let fixture: ComponentFixture<MenuAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuAdminComponent, HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getAvailableEnvironments: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuAdminComponent);
    component = fixture.componentInstance;
    component.environmentOptions = [
      { id: '*', label: 'Todos os ambientes' },
      { id: 'br-prod', label: 'Brasil - Produção' },
      { id: 'cl-prod', label: 'Chile - Produção' },
    ];
    fixture.detectChanges();
  });

  it('should treat the wildcard environment as selecting every environment and show a readable label', () => {
    expect(component.isEnvironmentSelected('*', 'br-prod')).toBeTrue();
    expect(component.getEnvironmentLabel('*')).toBe('Todos os ambientes');
  });
});
