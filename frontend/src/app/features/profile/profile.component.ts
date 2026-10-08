import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { AuthService, PortalGroup, PortalUser } from '../../core/auth/auth.service';
import { TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="header">
        <div>
          <p class="eyebrow">{{ t('profile.title') }}</p>
          <h1>{{ t('profile.subtitle') }}</h1>
        </div>
      </div>

      <div class="panel" *ngIf="user; else emptyState">
        <div class="details">
          <div class="detail-item"><span>{{ t('profile.login') }}</span><strong>{{ user.login }}</strong></div>
          <div class="detail-item"><span>{{ t('profile.name') }}</span><strong>{{ user.name }}</strong></div>
          <div class="detail-item"><span>{{ t('profile.email') }}</span><strong>{{ user.email }}</strong></div>
        </div>
      </div>

      <div class="panel groups">
        <div class="groups-header">
          <h2>{{ t('profile.groups') }}</h2>
          <span class="group-count">{{ groups.length }}</span>
        </div>

        <div class="group-grid">
          <div class="group-card" *ngFor="let group of groups">
            <span class="group-code">{{ group.id || group.name }}</span>
            <strong class="group-name">{{ group.description || group.name }}</strong>
          </div>
        </div>
      </div>
    </section>

    <ng-template #emptyState>
      <p class="empty">{{ t('profile.empty') }}</p>
    </ng-template>
  `,
  styles: [
    `
      :host { display: block; }
      .page-shell { padding: 32px; }
      .header { margin-bottom: 20px; }
      .eyebrow { text-transform: uppercase; letter-spacing: .08em; color: #0f4b9f; font-size: 12px; font-weight: 700; }
      h1 { margin: 8px 0 0; }
      .panel {
        background: white;
        border-radius: 18px;
        border: 1px solid #edf2fa;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 10px 24px rgba(27, 38, 57, 0.04);
      }
      .details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 18px;
      }
      .detail-item {
        display: grid;
        gap: 8px;
        padding: 16px 18px;
        border: 1px solid #eef1f6;
        border-radius: 12px;
        background: linear-gradient(180deg, #fff, #fafbff);
      }
      .details span {
        color: #5d6b7d;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .groups-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
      }
      .groups-header h2 {
        margin: 0;
      }
      .group-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 30px;
        height: 30px;
        padding: 0 10px;
        background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900));
        color: white;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
      }
      .group-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
      .group-card {
        display: grid;
        gap: 8px;
        padding: 16px 18px;
        border-radius: 14px;
        border: 1px solid #f1d8dc;
        background: linear-gradient(180deg, #fff8f8 0%, #fff 100%);
      }
      .group-code {
        color: var(--renner-red-700);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .group-name {
        color: var(--renner-ink);
        font-size: 0.98rem;
        line-height: 1.4;
      }
      .empty { color: #5d6b7d; }

      @media (max-width: 520px) {
        .page-shell { padding: 20px 16px; }
        .panel { padding: 18px 16px; }
        .groups-header { align-items: flex-start; }
      }
    `
  ]
})
export class ProfileComponent implements OnInit {
  user: PortalUser | null = null;
  groups: PortalGroup[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: ({ user, groups }) => {
        this.user = user;
        this.groups = groups;
      },
      error: () => {
        this.user = this.authService.getCurrentUser();
        this.groups = this.authService.getCurrentGroups();
      }
    });
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
