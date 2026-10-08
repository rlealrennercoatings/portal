import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { DatasulModule } from './datasul/datasul.module';
import { HealthController } from './health/health.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [DatasulModule],
  controllers: [AppController, AuthController, UsersController, HealthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
