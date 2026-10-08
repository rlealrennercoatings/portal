import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand-wrap">
          <img src="assets/renner.png" alt="Renner" class="brand-logo" />
          <div class="brand">Portal</div>
        </div>
        <nav>
          <a routerLink="/dashboard">Dashboard</a>
          <a routerLink="/profile">Perfil</a>
          <a href="#">Administrativo</a>
          <a href="#">Comercial</a>
          <a href="#">Logística</a>
          <a href="#">Financeiro</a>
          <a href="#">Industrial</a>
          <a href="#">TI</a>
        </nav>
      </aside>

      <main class="content">
        <header class="topbar">
          <div class="title">Portal Corporativo</div>
          <div class="account">
            <span>{{ userName }}</span>
            <button type="button" (click)="logout()">Sair</button>
          </div>
        </header>

        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      :host { display: block; height: 100vh; }
      .shell { display: flex; min-height: 100vh; background: linear-gradient(135deg, #fff9f9 0%, #fce9ea 100%); }
      .sidebar { width: 260px; background: linear-gradient(180deg, var(--renner-red-900) 0%, var(--renner-red-700) 100%); color: #fff; padding: 20px 18px; }
      .brand-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
      .brand-logo { width: 54px; height: auto; object-fit: contain; }
      .brand { font-size: 1.5rem; font-weight: 700; }
      nav { display: grid; gap: 8px; }
      nav a { color: rgba(255,255,255,0.85); text-decoration: none; padding: 10px 12px; border-radius: 10px; font-weight: 600; }
      nav a:hover { background: rgba(255,255,255,0.08); color: #fff; }
      .content { flex: 1; display: flex; flex-direction: column; }
      .topbar { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: rgba(255,255,255,0.85); border-bottom: 1px solid #f0d6d8; }
      .title { font-size: 1.25rem; font-weight: 700; color: var(--renner-red-900); }
      .account { display: flex; align-items: center; gap: 12px; color: var(--renner-ink); font-weight: 600; }
      button { background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900)); color: white; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-weight: 700; }
      button:hover { filter: brightness(1.05); }
    `
  ]
})
export class ShellComponent {
  userName = 'Usuário';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name ?? 'Usuário';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
