import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class MenuAdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    const groups = this.authService.getCurrentGroups();
    const hasSupAccess = groups.some((group) => {
      const values = [group?.id, group?.name, group?.description]
        .filter((value): value is string => !!value)
        .map((value) => value.trim().toLowerCase());

      return values.some((value) => ['sup', 's.u.p', 'supervisor', 'supervisores', 'grp-admin', 'admin', 'admins', 'administrador', 'administradores'].includes(value));
    });

    return hasSupAccess ? true : this.router.createUrlTree(['/dashboard']);
  }
}
