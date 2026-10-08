import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

import { DatasulService } from '../datasul/datasul.service';

@Controller()
export class UsersController {
  constructor(private readonly datasulService: DatasulService) {}

  private getSessionIdFromCookie(req: Request): string | undefined {
    const cookieHeader = req.headers.cookie ?? '';
    const match = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('portal_session='));

    return match ? decodeURIComponent(match.split('=')[1]) : undefined;
  }

  @Get('me')
  getCurrentUser(@Req() req: Request) {
    const sessionId = this.getSessionIdFromCookie(req);
    return this.datasulService.getUserBySession(sessionId) ?? this.datasulService.getUser();
  }

  @Get('me/groups')
  getCurrentUserGroups(@Req() req: Request) {
    const sessionId = this.getSessionIdFromCookie(req);
    return this.datasulService.getGroupsBySession(sessionId) ?? this.datasulService.getGroups();
  }
}
