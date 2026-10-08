import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-shell">
      <div class="login-card">
        <div class="brand-block">
          <img src="assets/renner.png" alt="Renner" class="renner-logo" />
          <span class="brand-badge">Portal</span>
          <h1>Portal Corporativo</h1>
          <p>Autenticação com Datasul</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <label>
            <span>Usuário</span>
            <input formControlName="username" type="text" placeholder="Informe o usuário Datasul" />
          </label>

          <label>
            <span>Senha</span>
            <input formControlName="password" type="password" placeholder="Informe a senha Datasul" />
          </label>

          <button type="submit" [disabled]="form.invalid || submitting">
            {{ submitting ? 'Entrando...' : 'Entrar' }}
          </button>

          <p class="error" *ngIf="errorMessage">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .login-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, #fff4f4 0%, #fce8e9 30%, #f7d8d9 100%);
        padding: 24px;
      }

      .login-card {
        width: min(100%, 440px);
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid var(--renner-border);
        border-radius: 20px;
        box-shadow: 0 26px 60px rgba(122, 12, 22, 0.12);
        padding: 30px 28px 28px;
      }

      .brand-block {
        margin-bottom: 24px;
        display: grid;
        justify-items: center;
        gap: 12px;
        text-align: center;
      }

      .renner-logo {
        display: block;
        width: 180px;
        height: auto;
        object-fit: contain;
        margin: 0 auto 4px;
      }

      .brand-badge {
        display: inline-block;
        width: fit-content;
        background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900));
        color: #fff;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        font-size: clamp(1.9rem, 2vw, 2.4rem);
        color: var(--renner-red-900);
      }

      p {
        margin: 0;
        color: var(--renner-muted);
      }

      .login-form {
        display: grid;
        gap: 18px;
      }

      label {
        display: grid;
        gap: 8px;
        font-weight: 600;
        color: var(--renner-ink);
      }

      input {
        width: 100%;
        border: 1px solid #f0c6ca;
        border-radius: 12px;
        height: 46px;
        padding: 0 14px;
        font-size: 1rem;
        box-sizing: border-box;
        background: #fff;
      }

      input:focus {
        outline: 2px solid rgba(194, 40, 45, 0.18);
        border-color: var(--renner-red-600);
      }

      button {
        height: 48px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900));
        color: white;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(182, 35, 45, 0.25);
      }

      button:disabled {
        opacity: 0.75;
        cursor: wait;
      }

      .error {
        color: #a91f2d;
        font-size: 0.9rem;
      }
    `
  ]
})
export class LoginComponent {
  submitting = false;
  errorMessage = '';

  form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.authService.login(this.form.value.username ?? '', this.form.value.password ?? '').subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.submitting = false;
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }
}
