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
          <div><span>{{ t('profile.login') }}</span><strong>{{ user.login }}</strong></div>
          <div><span>{{ t('profile.name') }}</span><strong>{{ user.name }}</strong></div>
          <div><span>{{ t('profile.email') }}</span><strong>{{ user.email }}</strong></div>
          <div><span>{{ t('profile.company') }}</span><strong>{{ user.company }}</strong></div>
          <div><span>{{ t('profile.establishment') }}</span><strong>{{ user.establishment }}</strong></div>
        </div>
      </div>

      <div class="panel groups">
        <h2>{{ t('profile.groups') }}</h2>
        <ul>
          <li *ngFor="let group of groups">{{ group.name }}</li>
        </ul>
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
      .panel { background: white; border-radius: 14px; border: 1px solid #edf2fa; padding: 24px; margin-bottom: 20px; }
      .details { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 18px; }
      .details div { display: grid; gap: 6px; }
      .details span { color: #5d6b7d; font-size: 0.8rem; text-transform: uppercase; }
      .groups ul { padding-left: 20px; display: grid; gap: 8px; }
      .empty { color: #5d6b7d; }

      @media (max-width: 520px) {
        .page-shell { padding: 20px 16px; }
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
        this.groups = [];
      }
    });
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
