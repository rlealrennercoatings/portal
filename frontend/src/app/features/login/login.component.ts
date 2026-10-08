import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, DatasulEnvironmentOption } from '../../core/auth/auth.service';
import { LocaleCode, TranslationService } from '../../core/i18n/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-shell">
      <div class="login-card">
        <div class="language-switcher" aria-label="Idioma">
          <button
            type="button"
            *ngFor="let language of languageOptions"
            [class.active]="language.code === currentLocale"
            (click)="setLanguage(language.code)"
            [attr.aria-label]="language.label"
          >
            <span>{{ language.flag }}</span>
            <span>{{ language.label }}</span>
          </button>
        </div>

        <div class="brand-block">
          <img src="assets/renner.png" alt="Renner" class="renner-logo" />
          <span class="brand-badge">{{ t('app.portal') }}</span>
          <h1>{{ t('login.title') }}</h1>
          <p>{{ t('login.subtitle') }}</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <label>
            <span>{{ t('login.environment') }}</span>
            <select formControlName="environmentId">
              <option *ngFor="let environment of environments" [value]="environment.id">
                {{ environment.label }}
              </option>
            </select>
          </label>

          <label>
            <span>{{ t('login.username') }}</span>
            <input formControlName="username" type="text" [placeholder]="t('login.usernamePlaceholder')" />
          </label>

          <label>
            <span>{{ t('login.password') }}</span>
            <input formControlName="password" type="password" [placeholder]="t('login.passwordPlaceholder')" />
          </label>

          <button type="submit" [disabled]="form.invalid || submitting">
            {{ submitting ? t('login.submitting') : t('login.submit') }}
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

      .language-switcher {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .language-switcher button {
        appearance: none;
        border: 1px solid #f4d0d4;
        background: #fff;
        color: var(--renner-ink);
        border-radius: 999px;
        padding: 6px 10px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        font-size: 0.78rem;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      .language-switcher button.active {
        background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900));
        color: #fff;
        border-color: transparent;
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
        width: clamp(108px, 34vw, 140px);
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
        font-size: clamp(1.7rem, 4vw, 2.4rem);
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

      select,
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

      select:focus,
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

      @media (max-width: 520px) {
        .login-shell {
          padding: 12px;
        }

        .login-card {
          padding: 20px 16px 18px;
          border-radius: 16px;
        }

        .language-switcher {
          justify-content: center;
        }
      }
    `
  ]
})
export class LoginComponent implements OnInit {
  submitting = false;
  errorMessage = '';
  currentLocale: LocaleCode = 'pt';
  languageOptions = this.translationService.getLanguageOptions();
  environments: DatasulEnvironmentOption[] = [
    { id: 'chile-desenv', label: 'Chile - Desenvolvimento', country: 'Chile', stage: 'desenvolvimento', baseUrl: 'https://erp-chile-desenv.renner.com.br' },
    { id: 'br-desenv', label: 'Brasil - Desenvolvimento', country: 'Brasil', stage: 'desenvolvimento', baseUrl: 'https://erp-desenv.renner.com.br' },
    { id: 'pe-desenv', label: 'Peru - Desenvolvimento', country: 'Peru', stage: 'desenvolvimento', baseUrl: 'https://erp-peru-desenv.renner.com.br' },
    { id: 'br-homolog', label: 'Brasil - Homologação', country: 'Brasil', stage: 'homologacao', baseUrl: 'https://erp-homol.renner.com.br' },
    { id: 'cl-homolog', label: 'Chile - Homologação', country: 'Chile', stage: 'homologacao', baseUrl: 'https://erp-chile-homol.renner.com.br' },
    { id: 'pe-homolog', label: 'Peru - Homologação', country: 'Peru', stage: 'homologacao', baseUrl: 'https://erp-peru-homol.renner.com.br' },
    { id: 'br-prod', label: 'Brasil - Produção', country: 'Brasil', stage: 'production', baseUrl: 'https://erp.renner.com.br' },
    { id: 'cl-prod', label: 'Chile - Produção', country: 'Chile', stage: 'production', baseUrl: 'https://erp-chile.renner.com.br' },
    { id: 'pe-prod', label: 'Peru - Produção', country: 'Peru', stage: 'production', baseUrl: 'https://erp-peru.renner.com.br' },
  ];

  form = new FormGroup({
    environmentId: new FormControl('chile-desenv', { nonNullable: true, validators: [Validators.required] }),
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translationService: TranslationService
  ) {
    this.currentLocale = this.translationService.getCurrentLocale();
  }

  ngOnInit(): void {
    this.authService.getAvailableEnvironments().subscribe((environments) => {
      if (environments.length > 0) {
        this.environments = environments;
        const selected = environments.find((environment) => environment.id === 'chile-desenv') ?? environments[0];
        this.form.controls.environmentId.setValue(selected.id, { emitEvent: false });
      }
    });
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  setLanguage(locale: LocaleCode): void {
    this.translationService.setLanguage(locale);
    this.currentLocale = locale;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.authService
      .login(
        this.form.value.username ?? '',
        this.form.value.password ?? '',
        this.form.value.environmentId ?? 'chile-desenv'
      )
      .subscribe({
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
