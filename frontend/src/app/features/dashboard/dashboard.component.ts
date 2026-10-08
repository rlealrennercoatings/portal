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

      <div class="grid">
        <article class="card primary">
          <span>{{ t('dashboard.activeUsers') }}</span>
          <strong>1.248</strong>
        </article>
        <article class="card">
          <span>{{ t('dashboard.datasulGroups') }}</span>
          <strong>3</strong>
        </article>
        <article class="card">
          <span>{{ t('dashboard.applications') }}</span>
          <strong>7</strong>
        </article>
      </div>

      <div class="panel">
        <h2>{{ t('dashboard.architectureTitle') }}</h2>
        <ul>
          <li>{{ t('dashboard.architectureItem1') }}</li>
          <li>{{ t('dashboard.architectureItem2') }}</li>
          <li>{{ t('dashboard.architectureItem3') }}</li>
          <li>{{ t('dashboard.architectureItem4') }}</li>
        </ul>
      </div>
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
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 24px; }
      .card { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 8px 20px rgba(122, 12, 22, 0.08); border: 1px solid #f0d0d3; }
      .card.primary { background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900)); color: white; }
      .card span { display: block; font-size: 0.9rem; opacity: 0.8; }
      .card strong { display: block; margin-top: 8px; font-size: 2rem; }
      .panel { background: white; border-radius: 14px; border: 1px solid #f0d0d3; padding: 24px; }
      ul { margin: 0; padding-left: 20px; display: grid; gap: 8px; }

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
