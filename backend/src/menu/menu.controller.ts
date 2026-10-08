import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from '../auth/auth.service';
import { MenuArea, MenuApplication, MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly authService: AuthService,
  ) {}

  private getSessionIdFromCookie(req: Request): string | undefined {
    const cookieHeader = req.headers.cookie ?? '';
    const match = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('portal_session='));

    return match ? decodeURIComponent(match.split('=')[1]) : undefined;
  }

  @Get('catalog')
  getCatalog() {
    return this.menuService.getAllAreas();
  }

  @Post('areas')
  createArea(@Body() area: Partial<MenuArea> & { applications?: Array<Partial<MenuApplication>> }) {
    return this.menuService.createArea(area);
  }

  @Patch('areas/:areaId')
  updateArea(@Param('areaId') areaId: string, @Body() changes: Partial<MenuArea>) {
    return this.menuService.updateArea(areaId, changes);
  }

  @Delete('areas/:areaId')
  deleteArea(@Param('areaId') areaId: string) {
    return { success: this.menuService.removeArea(areaId) };
  }

  @Post('areas/:areaId/applications')
  createApplication(@Param('areaId') areaId: string, @Body() application: Partial<MenuApplication>) {
    return this.menuService.createApplication(areaId, application);
  }

  @Patch('areas/:areaId/applications/:applicationId')
  updateApplication(
    @Param('areaId') areaId: string,
    @Param('applicationId') applicationId: string,
    @Body() changes: Partial<MenuApplication>,
  ) {
    return this.menuService.updateApplication(areaId, applicationId, changes);
  }

  @Delete('areas/:areaId/applications/:applicationId')
  deleteApplication(@Param('areaId') areaId: string, @Param('applicationId') applicationId: string) {
    return { success: this.menuService.removeApplication(areaId, applicationId) };
  }

  @Get('areas')
  getAccessibleAreas(@Req() req: Request) {
    const sessionId = this.getSessionIdFromCookie(req);
    const session = this.authService.getSession(sessionId);
    const groups = session.groups ?? [];
    const environmentId = session.environment?.id ?? session.environment?.label;

    return this.menuService.getAccessibleAreas(groups, environmentId);
  }
}
