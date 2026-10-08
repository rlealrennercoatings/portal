import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { TranslationService } from '../../core/i18n/translation.service';
import { AppMenuService } from '../../core/menu/app-menu.service';
import { ShellComponent } from './shell.component';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => ({
              id: '1',
              login: 'user',
              name: 'Usuário Teste',
              email: 'user@test.com',
              company: 'Renner',
              establishment: 'SP',
              environment: { id: 'br-prod', label: 'Brasil - Produção', country: 'Brasil', stage: 'production', baseUrl: 'https://erp.renner.com.br' },
              groups: [{ id: 'sup', name: 'sup', description: 'Supervisor' }],
            }),
            getCurrentGroups: () => [{ id: 'sup', name: 'sup', description: 'Supervisor' }],
            logout: () => undefined,
          },
        },
        {
          provide: TranslationService,
          useValue: {
            getLanguageOptions: () => [],
            getCurrentLocale: () => 'pt',
            setLanguage: () => undefined,
            t: (key: string) => key,
          },
        },
        {
          provide: AppMenuService,
          useValue: {
            loadAccessibleAreas: () =>
              of([
                {
                  id: 'foundation',
                  name: 'Foundation',
                  applications: [{ id: 'menu-admin', name: 'Administração do menu', route: '/menu-admin', allowedGroups: ['sup'] }],
                },
              ]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
  });

  it('should not render a separate root-level admin menu link when it is already available inside Foundation', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLElement[];
    const adminLinks = links.filter((link) => link.textContent?.trim().toLowerCase().includes('admin'));

    expect(adminLinks.length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Foundation');
    expect(fixture.nativeElement.textContent).toContain('Administração do menu');
  });
});
