import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Visão geral</p>
          <h1>Dashboard</h1>
        </div>
        <a routerLink="/profile">Meu perfil</a>
      </header>

      <div class="grid">
        <article class="card primary">
          <span>Usuários ativos</span>
          <strong>1.248</strong>
        </article>
        <article class="card">
          <span>Grupos Datasul</span>
          <strong>3</strong>
        </article>
        <article class="card">
          <span>Aplicações</span>
          <strong>7</strong>
        </article>
      </div>

      <div class="panel">
        <h2>Arquitetura preparada para crescimento</h2>
        <ul>
          <li>Login autorizado pela identidade do Datasul</li>
          <li>Menu extensível por área</li>
          <li>Perfil com usuário e grupos</li>
          <li>Plataforma base para novas aplicações</li>
        </ul>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .page-shell { padding: 32px; }
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
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
    `
  ]
})
export class DashboardComponent {}
