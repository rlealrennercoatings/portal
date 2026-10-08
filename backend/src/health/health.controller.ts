import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'portal-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/datasul')
  datasulHealth() {
    return {
      status: 'unknown',
      message: 'Integração Datasul não validada no ambiente real. Verificar configuração oficial.',
    };
  }
}
