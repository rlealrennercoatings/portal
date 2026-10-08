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
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <label>
            <span>{{ t('login.environment') }}</span>
            <select formControlName="environmentId" (change)="onEnvironmentChange($event)">
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
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin: 0 auto 12px;
        flex-wrap: wrap;
        width: 100%;
      }

      .language-switcher button {
        appearance: none;
        border: 1px solid #f1d1d4;
        background: rgba(255, 255, 255, 0.82);
        color: var(--renner-ink);
        border-radius: 999px;
        padding: 7px 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        font-size: 0.76rem;
        font-weight: 600;
        transition: all 0.2s ease;
        line-height: 1.2;
        box-shadow: 0 4px 12px rgba(123, 15, 26, 0.06);
      }

      .language-switcher button:hover {
        border-color: var(--renner-red-600);
        transform: translateY(-1px);
      }

      .language-switcher button.active {
        background: linear-gradient(135deg, var(--renner-red-600), var(--renner-red-900));
        color: #fff;
        border-color: transparent;
        box-shadow: 0 8px 18px rgba(162, 29, 42, 0.2);
      }

      .brand-block {
        margin-bottom: 18px;
        display: grid;
        justify-items: center;
        text-align: center;
      }

      .renner-logo {
        display: block;
        width: clamp(110px, 32vw, 150px);
        height: auto;
        object-fit: contain;
        margin: 0 auto;
        filter: drop-shadow(0 6px 12px rgba(123, 15, 26, 0.12));
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

      label span {
        font-size: 0.86rem;
        letter-spacing: 0.02em;
      }

      select,
      input {
        width: 100%;
        border: 1px solid #efcbd0;
        border-radius: 12px;
        height: 46px;
        padding: 0 14px;
        font-size: 1rem;
        box-sizing: border-box;
        background: #fff;
        color: var(--renner-ink);
        transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      }

      select:hover,
      input:hover {
        border-color: #e1a3aa;
      }

      select:focus,
      input:focus {
        outline: none;
        border-color: var(--renner-red-600);
        box-shadow: 0 0 0 4px rgba(194, 40, 45, 0.12);
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
        transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
      }

      button:hover:not(:disabled) {
        transform: translateY(-1px);
        filter: brightness(1.03);
      }

      button:disabled {
        opacity: 0.75;
        cursor: wait;
      }

      .error {
        color: #a91f2d;
        font-size: 0.9rem;
        margin: -6px 0 0;
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
          width: 100%;
          margin-bottom: 10px;
        }

        .language-switcher button {
          flex: 0 0 auto;
          min-width: 0;
          padding: 7px 10px;
        }

        .language-switcher button span:last-child {
          display: none;
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
  environmentOptions: { label: string; value: string }[] = [];
  environments: DatasulEnvironmentOption[] = [
    { id: 'cl-desenv', label: 'Chile - Desenvolvimento', country: 'Chile', stage: 'desenvolvimento', baseUrl: 'https://erp-chile-desenv.renner.com.br' },
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
    environmentId: new FormControl(this.authService.getLastSelectedEnvironmentId(), { nonNullable: true, validators: [Validators.required] }),
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
        this.environmentOptions = environments.map((environment) => ({
          label: environment.label,
          value: environment.id
        }));

        const preferredEnvironmentId = this.authService.getLastSelectedEnvironmentId();
        const selected = environments.find((environment) => environment.id === preferredEnvironmentId) ?? environments[0];
        this.form.controls.environmentId.setValue(selected.id, { emitEvent: false });
        this.authService.setLastSelectedEnvironmentId(selected.id);
      } else {
        this.environmentOptions = this.environments.map((environment) => ({
          label: environment.label,
          value: environment.id
        }));
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

  onEnvironmentChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    const environmentId = target?.value ?? this.authService.getLastSelectedEnvironmentId();
    this.authService.setLastSelectedEnvironmentId(environmentId);
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const selectedEnvironmentId = this.form.value.environmentId ?? this.authService.getLastSelectedEnvironmentId();
    this.authService.setLastSelectedEnvironmentId(selectedEnvironmentId);

    this.submitting = true;
    this.errorMessage = '';

    this.authService
      .login(
        this.form.value.username ?? '',
        this.form.value.password ?? '',
        selectedEnvironmentId
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
