import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { LocaleCode, TranslationService } from '../../core/i18n/translation.service';
import { AppMenuService, MenuApplication, MenuArea } from '../../core/menu/app-menu.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="shell" [class.sidebar-collapsed]="isSidebarCollapsed" [class.mobile-menu-open]="isMobileMenuOpen">
      <aside class="sidebar" [class.mobile-open]="isMobileMenuOpen">
        <div class="brand-wrap">
          <button type="button" class="collapse-toggle" (click)="toggleSidebar()" aria-label="Recolher menu">
            {{ isSidebarCollapsed ? '»' : '«' }}
          </button>
        </div>
        <nav class="menu-nav">
          <a routerLink="/dashboard" class="nav-link root-link" (click)="closeMobileMenuIfNeeded()">{{ t('shell.dashboard') }}</a>
          <a routerLink="/profile" class="nav-link root-link" (click)="closeMobileMenuIfNeeded()">{{ t('shell.profile') }}</a>

          <div class="area-group" *ngFor="let area of visibleAreas">
            <button type="button" class="area-toggle" (click)="toggleArea(area.id)" [class.expanded]="isAreaExpanded(area.id)">
              <span>{{ area.name }}</span>
              <span class="area-chevron">{{ isAreaExpanded(area.id) ? '▾' : '▸' }}</span>
            </button>

            <div class="applications" *ngIf="isAreaExpanded(area.id)">
              <button
                type="button"
                class="application-button"
                *ngFor="let application of area.applications"
                (click)="openApplication(application)"
              >
                {{ application.name }}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <div class="mobile-overlay" *ngIf="isMobileMenuOpen" (click)="closeMobileMenu()"></div>

      <main class="content" (pointerdown)="onContentInteraction()">
        <header class="topbar">
          <div class="title-wrap">
            <img src="assets/renner.png" alt="Renner" class="header-logo" />
            <div class="title">{{ t('shell.corporatePortal') }}</div>
          </div>

          <div class="account-area">
            <div class="language-switcher" aria-label="Idioma">
              <button
                type="button"
                *ngFor="let language of languageOptions"
                [class.active]="language.code === currentLocale"
                (click)="setLanguage(language.code)"
                [attr.aria-label]="language.label"
                title="{{ language.label }}"
              >
                {{ language.flag }}
              </button>
            </div>

            <div class="account">
              <span class="user-meta">
                <strong>{{ userName }}</strong>
                <small>{{ environmentLabel }}</small>
              </span>
              <button type="button" class="logout-button" (click)="logout()">
                {{ t('shell.logout') }}
              </button>
            </div>
          </div>
        </header>

        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host{display:block;min-height:100vh}.shell{display:flex;min-height:100vh;background:linear-gradient(135deg,#fff9f9,#fce9ea);position:relative}.sidebar{width:260px;background:linear-gradient(180deg,var(--renner-red-900),var(--renner-red-700));color:#fff;padding:20px 18px;transition:width .25s ease}.shell.sidebar-collapsed .sidebar{width:62px;padding-left:12px;padding-right:12px}.brand-wrap{display:flex;align-items:center;justify-content:flex-start;margin-bottom:24px}.collapse-toggle{width:36px;height:36px;min-width:36px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;cursor:pointer;transition:transform .2s ease}.shell.sidebar-collapsed .collapse-toggle{transform:translateX(0)}.menu-nav{display:grid;gap:8px}.nav-link,.area-toggle,.application-button{color:rgba(255,255,255,.85);text-decoration:none;border:none;background:transparent;width:100%;text-align:left;padding:10px 12px;border-radius:10px;font-weight:600;white-space:nowrap;transition:padding .2s ease,background .2s ease,color .2s ease;cursor:pointer}.nav-link:hover,.area-toggle:hover,.application-button:hover{background:rgba(255,255,255,.08);color:#fff}.area-group{display:grid;gap:6px}.area-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px}.applications{display:grid;gap:6px;padding-left:8px}.application-button{padding:9px 10px;font-size:.87rem;color:rgba(255,255,255,.9);text-align:left}.shell.sidebar-collapsed .nav-link,.shell.sidebar-collapsed .area-toggle,.shell.sidebar-collapsed .application-button{padding:10px 8px;text-align:center;font-size:0;overflow:hidden}.content{flex:1;display:flex;flex-direction:column}.topbar{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:18px 24px;background:rgba(255,255,255,.85);border-bottom:1px solid #f0d6d8}.title-wrap{display:flex;align-items:center;gap:12px}.header-logo{width:42px;height:auto;object-fit:contain}.title{font-size:1.25rem;font-weight:700;color:var(--renner-red-900)}.account-area{display:flex;align-items:center;justify-content:flex-end;gap:16px;flex-wrap:wrap}.language-switcher{display:inline-flex;gap:8px;background:#fff3f3;border:1px solid #f2d4d7;border-radius:999px;padding:6px}.language-switcher button{border:none;background:transparent;color:var(--renner-ink);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.1rem}.language-switcher button.active{background:linear-gradient(135deg,var(--renner-red-600),var(--renner-red-900));color:#fff;box-shadow:0 8px 18px rgba(162,29,42,.18)}.account{display:flex;align-items:center;gap:12px;color:var(--renner-ink);font-weight:600}.user-meta{display:flex;flex-direction:column;align-items:flex-end;line-height:1.2}.user-meta strong{font-size:.95rem}.user-meta small{font-size:.7rem;color:var(--renner-muted)}.logout-button{appearance:none;background:linear-gradient(135deg,var(--renner-red-600),var(--renner-red-900));color:#fff;border:none;border-radius:10px;padding:10px 16px;cursor:pointer;font-weight:700;font-size:.82rem;letter-spacing:.02em;box-shadow:0 10px 20px rgba(162,29,42,.18);transition:transform .2s ease,box-shadow .2s ease,filter .2s ease}.logout-button:hover{transform:translateY(-1px);filter:brightness(1.04);box-shadow:0 12px 22px rgba(162,29,42,.22)}.mobile-overlay{position:fixed;inset:0;background:rgba(39,17,20,.35);z-index:50}@media (max-width:900px){.shell{flex-direction:column;min-height:100vh}.sidebar{position:fixed;top:0;left:0;bottom:0;width:260px;max-width:82vw;z-index:100;transform:translateX(-105%);transition:transform .25s ease;box-shadow:0 24px 44px rgba(66,17,23,.28)}.sidebar.mobile-open{transform:translateX(0)}.shell.sidebar-collapsed .sidebar{width:260px;padding-left:18px;padding-right:18px}.shell.mobile-menu-open .content{filter:blur(.5px)}.menu-nav{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}}@media (max-width:520px){.topbar{flex-direction:column;align-items:flex-start}.account-area{width:100%;justify-content:space-between}.user-meta{align-items:flex-start}}`]
})
export class ShellComponent {
  userName = 'Usuário';
  environmentLabel = 'Ambiente não informado';
  currentLocale: LocaleCode = 'pt';
  languageOptions = this.translationService.getLanguageOptions();
  isSidebarCollapsed = false;
  isMobileMenuOpen = false;
  visibleAreas: MenuArea[] = [];
  expandedAreaIds: Record<string, boolean> = {};
  private readonly mobileCollapseThreshold = 900;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translationService: TranslationService,
    private readonly appMenuService: AppMenuService
  ) {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name ?? 'Usuário';
    this.environmentLabel = user?.environment?.label ?? 'Ambiente não informado';
    this.currentLocale = this.translationService.getCurrentLocale();
    this.loadVisibleAreas();
    this.syncMobileCollapseState();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncMobileCollapseState();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMobileMenu();
  }

  onContentInteraction(): void {
    if (window.innerWidth <= this.mobileCollapseThreshold && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleSidebar(): void {
    if (window.innerWidth <= this.mobileCollapseThreshold) {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
      return;
    }

    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  closeMobileMenuIfNeeded(): void {
    if (window.innerWidth <= this.mobileCollapseThreshold) {
      this.closeMobileMenu();
    }
  }

  toggleArea(areaId: string): void {
    this.expandedAreaIds[areaId] = !this.expandedAreaIds[areaId];
  }

  isAreaExpanded(areaId: string): boolean {
    return !!this.expandedAreaIds[areaId];
  }

  openApplication(application: MenuApplication): void {
    if (application.route) {
      this.router.navigateByUrl(application.route);
      this.closeMobileMenuIfNeeded();
      return;
    }

    this.closeMobileMenuIfNeeded();
  }

  private loadVisibleAreas(): void {
    this.appMenuService.loadAccessibleAreas().subscribe((areas) => {
      this.visibleAreas = areas;
      this.expandedAreaIds = {};
      this.visibleAreas.forEach((area) => {
        this.expandedAreaIds[area.id] = true;
      });
    });
  }

  private syncMobileCollapseState(): void {
    if (window.innerWidth > this.mobileCollapseThreshold) {
      this.isMobileMenuOpen = false;
      return;
    }

    if (!this.isMobileMenuOpen && !this.isSidebarCollapsed) {
      this.isSidebarCollapsed = true;
    }
  }

  t(key: string): string {
    return this.translationService.t(key);
  }

  setLanguage(locale: LocaleCode): void {
    this.translationService.setLanguage(locale);
    this.currentLocale = locale;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
