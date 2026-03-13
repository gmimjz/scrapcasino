import type { User } from '../../database/types';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { IsPublic } from '../../decorators/is-public.decorator';
import { AuthService } from './auth.service';
import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';
import { type FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @IsPublic()
  @Redirect()
  async login() {
    return await this.authService.login();
  }

  @Get('/return')
  @IsPublic()
  @Redirect()
  async return(
    @Res({ passthrough: true }) reply: FastifyReply,
    @Query() query: Record<string, string>,
  ) {
    return await this.authService.return(reply, query);
  }

  @Get('/logout')
  async logout(
    @Res({ passthrough: true }) reply: FastifyReply,
    @CurrentUser() user: User,
  ) {
    return await this.authService.logout(reply, user);
  }
}
