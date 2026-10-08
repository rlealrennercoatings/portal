import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getSessionIdFromCookie(req: Request): string | undefined {
    const cookieHeader = req.headers.cookie ?? '';
    const match = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('portal_session='));

    return match ? decodeURIComponent(match.split('=')[1]) : undefined;
  }

  @Post('login')
  async login(
    @Body() payload: { username: string; password: string; domain?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(payload.username, payload.password, payload.domain);

    res.cookie('portal_session', result.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return {
      success: true,
      user: result.user,
      groups: result.groups,
    };
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = this.getSessionIdFromCookie(req);
    this.authService.logout(sessionId);
    res.clearCookie('portal_session');
    return { success: true, message: 'Logout realizado com sucesso.' };
  }

  @Get('session')
  getSession(@Req() req: Request) {
    const sessionId = this.getSessionIdFromCookie(req);
    return this.authService.getSession(sessionId);
  }
}
