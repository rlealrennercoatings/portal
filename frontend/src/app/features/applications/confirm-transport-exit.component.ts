import { Component } from '@angular/core';

@Component({
  selector: 'app-confirm-transport-exit',
  standalone: true,
  template: `
    <section class="page-shell">
      <header class="page-header">
        <div>
          <p class="eyebrow">Logística</p>
          <h1>Confirma saída transporte</h1>
        </div>
      </header>

      <div class="panel">
        <div class="toolbar">
          <div class="chip">Transportes pendentes: 14</div>
          <button type="button">Confirmar seleção</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nota</th>
              <th>Placa</th>
              <th>Destino</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>NT-2024-118</td>
              <td>ABC-1234</td>
              <td>Centro 03</td>
              <td><span class="badge pending">Aguardando</span></td>
            </tr>
            <tr>
              <td>NT-2024-121</td>
              <td>DEF-5678</td>
              <td>Centro 07</td>
              <td><span class="badge ready">Confirmado</span></td>
            </tr>
            <tr>
              <td>NT-2024-132</td>
              <td>GHI-9012</td>
              <td>Centro 02</td>
              <td><span class="badge warning">Em revisão</span></td>
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
      .panel { background: white; border-radius: 14px; border: 1px solid #f0d0d3; padding: 24px; }
      .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
      .chip { background: #fff3f3; border: 1px solid #f0d0d3; color: var(--renner-red-900); border-radius: 999px; padding: 8px 12px; font-weight: 700; }
      button { background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900)); color: white; border: none; border-radius: 10px; padding: 10px 16px; font-weight: 700; cursor: pointer; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 12px 10px; border-bottom: 1px solid #f3dfe2; }
      th { font-size: .8rem; text-transform: uppercase; letter-spacing: .05em; color: var(--renner-muted); }
      .badge { display: inline-flex; padding: 6px 10px; border-radius: 999px; font-size: .72rem; font-weight: 700; }
      .badge.pending { background: #fff1d7; color: #9b6700; }
      .badge.ready { background: #dff8eb; color: #1d7d4c; }
      .badge.warning { background: #fff2f2; color: #b33a3a; }

      @media (max-width: 520px) {
        .page-shell { padding: 20px 16px; }
        .toolbar { flex-direction: column; align-items: flex-start; }
      }
    `
  ]
})
export class AppConfirmTransportExitComponent {}
