import { Routes } from '@angular/router';

import { AuthGuard } from './core/auth/auth.guard';
import { MenuAdminGuard } from './core/auth/menu-admin.guard';
import { AppConfirmTransportExitComponent } from './features/applications/confirm-transport-exit.component';
import { AppPickingComponent } from './features/applications/picking.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MenuAdminComponent } from './features/menu-admin/menu-admin.component';
import { LoginComponent } from './features/login/login.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'menu-admin', component: MenuAdminComponent, canActivate: [MenuAdminGuard] },
      { path: 'apps/separacao-picking', component: AppPickingComponent },
      { path: 'apps/confirma-saida-transporte', component: AppConfirmTransportExitComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
