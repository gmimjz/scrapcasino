import { AuthGuard } from '../../guards/auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AuthService,
    AuthGuard,
  ],
  exports: [AuthGuard],
})
export class AuthModule {}
