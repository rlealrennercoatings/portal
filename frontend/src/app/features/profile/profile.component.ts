import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { AuthService, PortalGroup, PortalUser } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <div class="header">
        <div>
          <p class="eyebrow">Meu perfil</p>
          <h1>Dados do usuário</h1>
        </div>
      </div>

      <div class="panel" *ngIf="user; else emptyState">
        <div class="details">
          <div><span>Login</span><strong>{{ user.login }}</strong></div>
          <div><span>Nome</span><strong>{{ user.name }}</strong></div>
          <div><span>E-mail</span><strong>{{ user.email }}</strong></div>
          <div><span>Empresa</span><strong>{{ user.company }}</strong></div>
          <div><span>Estabelecimento</span><strong>{{ user.establishment }}</strong></div>
        </div>
      </div>

      <div class="panel groups">
        <h2>Grupos Datasul</h2>
        <ul>
          <li *ngFor="let group of groups">{{ group.name }}</li>
        </ul>
      </div>
    </section>

    <ng-template #emptyState>
      <p class="empty">Nenhuma informação de usuário disponível.</p>
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
    `
  ]
})
export class ProfileComponent implements OnInit {
  user: PortalUser | null = null;
  groups: PortalGroup[] = [];

  constructor(private readonly authService: AuthService) {}

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
}
