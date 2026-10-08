import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('dashboard.overview') }}</p>
          <h1>Dashboard</h1>
        </div>
        <a routerLink="/profile">{{ t('dashboard.profileLink') }}</a>
      </header>

    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .page-shell { padding: 32px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
      .eyebrow { text-transform: uppercase; letter-spacing: .08em; color: var(--renner-red-700); font-size: 12px; font-weight: 700; }
      h1 { margin: 8px 0 0; color: var(--renner-red-900); }
      a { color: var(--renner-red-700); text-decoration: none; font-weight: 600; }
      @media (max-width: 520px) {
        .page-shell { padding: 20px 16px; }
        .page-header { flex-direction: column; align-items: flex-start; }
      }
    `
  ]
})
export class DashboardComponent {
  constructor(private readonly translationService: TranslationService) {}

  t(key: string): string {
    return this.translationService.t(key);
  }
}
