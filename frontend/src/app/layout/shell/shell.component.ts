import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { LocaleCode, TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand-wrap">
          <img src="assets/renner.png" alt="Renner" class="brand-logo" />
          <div class="brand">{{ t('app.portal') }}</div>
        </div>
        <nav>
          <a routerLink="/dashboard">{{ t('shell.dashboard') }}</a>
          <a routerLink="/profile">{{ t('shell.profile') }}</a>
          <a href="#">{{ t('shell.administrative') }}</a>
          <a href="#">{{ t('shell.commercial') }}</a>
          <a href="#">{{ t('shell.logistics') }}</a>
          <a href="#">{{ t('shell.financial') }}</a>
          <a href="#">{{ t('shell.industrial') }}</a>
          <a href="#">{{ t('shell.it') }}</a>
        </nav>
      </aside>

      <main class="content">
        <header class="topbar">
          <div class="title">{{ t('shell.corporatePortal') }}</div>

          <div class="account-area">
            <div class="language-switcher" aria-label="Idioma">
              <button
                type="button"
                *ngFor="let language of languageOptions"
                [class.active]="language.code === currentLocale"
                (click)="setLanguage(language.code)"
                [attr.aria-label]="language.label"
                title="{{ language.label }}"
              >
                {{ language.flag }}
              </button>
            </div>

            <div class="account">
              <span class="user-meta">
                <strong>{{ userName }}</strong>
                <small>{{ environmentLabel }}</small>
              </span>
              <button type="button" class="logout-button" (click)="logout()">{{ t('shell.logout') }}</button>
            </div>
          </div>
        </header>

        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; }
      .shell { display: flex; min-height: 100vh; background: linear-gradient(135deg, #fff9f9 0%, #fce9ea 100%); }
      .sidebar { width: 260px; background: linear-gradient(180deg, var(--renner-red-900) 0%, var(--renner-red-700) 100%); color: #fff; padding: 20px 18px; }
      .brand-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
      .brand-logo { width: 54px; height: auto; object-fit: contain; }
      .brand { font-size: 1.5rem; font-weight: 700; }
      nav { display: grid; gap: 8px; }
      nav a { color: rgba(255,255,255,0.85); text-decoration: none; padding: 10px 12px; border-radius: 10px; font-weight: 600; }
      nav a:hover { background: rgba(255,255,255,0.08); color: #fff; }
      .content { flex: 1; display: flex; flex-direction: column; }
      .topbar { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 18px 24px; background: rgba(255,255,255,0.85); border-bottom: 1px solid #f0d6d8; }
      .title { font-size: 1.25rem; font-weight: 700; color: var(--renner-red-900); }
      .account-area { display: flex; align-items: center; justify-content: flex-end; gap: 16px; flex-wrap: wrap; }
      .language-switcher { display: inline-flex; gap: 8px; background: #fff3f3; border: 1px solid #f2d4d7; border-radius: 999px; padding: 6px; }
      .language-switcher button { border: none; background: transparent; color: var(--renner-ink); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.1rem; }
      .language-switcher button.active { background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900)); color: white; box-shadow: 0 8px 18px rgba(162, 29, 42, 0.18); }
      .account { display: flex; align-items: center; gap: 12px; color: var(--renner-ink); font-weight: 600; }
      .user-meta { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2; }
      .user-meta strong { font-size: 0.95rem; }
      .user-meta small { font-size: 0.7rem; color: var(--renner-muted); }
      .logout-button { background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900)); color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 700; }
      .logout-button:hover { filter: brightness(1.05); }

      @media (max-width: 900px) {
        .shell { flex-direction: column; }
        .sidebar { width: 100%; }
        nav { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
      }

      @media (max-width: 520px) {
        .topbar {
          flex-direction: column;
          align-items: flex-start;
        }

        .account-area {
          width: 100%;
          justify-content: space-between;
        }

        .user-meta {
          align-items: flex-start;
        }
      }
    `
  ]
})
export class ShellComponent {
  userName = 'Usuário';
  environmentLabel = 'Ambiente não informado';
  currentLocale: LocaleCode = 'pt';
  languageOptions = this.translationService.getLanguageOptions();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translationService: TranslationService
  ) {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name ?? 'Usuário';
    this.environmentLabel = user?.environment?.label ?? 'Ambiente não informado';
    this.currentLocale = this.translationService.getCurrentLocale();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  setLanguage(locale: LocaleCode): void {
    this.translationService.setLanguage(locale);
    this.currentLocale = locale;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
