import { Component } from '@angular/core';

@Component({
  selector: 'app-picking',
  standalone: true,
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Logística</p>
          <h1>Separação (Picking)</h1>
        </div>
      </header>

      <div class="stats-grid">
        <article class="stat-card primary">
          <span>Pedidos pendentes</span>
          <strong>128</strong>
        </article>
        <article class="stat-card">
          <span>Em separação</span>
          <strong>42</strong>
        </article>
        <article class="stat-card">
          <span>Tempo médio</span>
          <strong>17 min</strong>
        </article>
      </div>

      <div class="panel">
        <h2>Fila de separação</h2>
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Loja</th>
              <th>Volume</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PO-10482</td>
              <td>SP-01</td>
              <td>12 caixas</td>
              <td><span class="badge pending">Pendente</span></td>
            </tr>
            <tr>
              <td>PO-10495</td>
              <td>RJ-04</td>
              <td>8 caixas</td>
              <td><span class="badge in-progress">Separando</span></td>
            </tr>
            <tr>
              <td>PO-10513</td>
              <td>BH-02</td>
              <td>19 caixas</td>
              <td><span class="badge ready">Pronto</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .page-shell { padding: 32px; }
      .page-header { margin-bottom: 24px; }
      .eyebrow { text-transform: uppercase; letter-spacing: .08em; color: var(--renner-red-700); font-size: 12px; font-weight: 700; }
      h1 { margin: 8px 0 0; color: var(--renner-red-900); }
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 24px; }
      .stat-card { background: white; border: 1px solid #f0d0d3; border-radius: 14px; padding: 22px; box-shadow: 0 8px 20px rgba(122,12,22,.08); }
      .stat-card.primary { background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900)); color: white; }
      .stat-card span { display: block; font-size: .9rem; opacity: .8; }
      .stat-card strong { display: block; margin-top: 8px; font-size: 2rem; }
      .panel { background: white; border-radius: 14px; border: 1px solid #f0d0d3; padding: 24px; }
      h2 { margin-top: 0; color: var(--renner-red-900); }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #f3dfe2; }
      th { font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; color: var(--renner-muted); }
      .badge { display: inline-flex; padding: 6px 10px; border-radius: 999px; font-size: .72rem; font-weight: 700; }
      .badge.pending { background: #fff1d7; color: #9b6700; }
      .badge.in-progress { background: #dff3ff; color: #0f5d91; }
      .badge.ready { background: #dff8eb; color: #1d7d4c; }

      @media (max-width: 520px) {
        .page-shell { padding: 20px 16px; }
      }
    `
  ]
})
export class AppPickingComponent {}
