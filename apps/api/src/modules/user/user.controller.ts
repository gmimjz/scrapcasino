import type { User } from '../../database/types';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { IsPublic } from '../../decorators/is-public.decorator';
import {
  PublicUserWrappedResponse,
  SetSteamTradeUrlBody,
  SetClientSeedBody,
  UserWrappedResponse,
} from './user.dto';
import { UserService } from './user.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';

@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getUser(@CurrentUser() user: User): Promise<UserWrappedResponse> {
    return this.userService.getUser(user);
  }

  @Get('/:userId')
  @IsPublic()
  async getUserById(
    @Param('userId') userId: string,
  ): Promise<PublicUserWrappedResponse> {
    return await this.userService.getUserById(userId);
  }

  @Post('/steam-trade-url')
  async setSteamTradeUrl(
    @CurrentUser() user: User,
    @Body() body: SetSteamTradeUrlBody,
  ): Promise<UserWrappedResponse> {
    const { steamTradeUrl } = body;
    return await this.userService.setSteamTradeUrl(user, steamTradeUrl);
  }

  @Post('/server-seed/rotate')
  async rotateServerSeed(
    @CurrentUser() user: User,
  ): Promise<UserWrappedResponse> {
    return await this.userService.rotateServerSeed(user);
  }

  @Put('/client-seed')
  async setClientSeed(
    @CurrentUser() user: User,
    @Body() body: SetClientSeedBody,
  ): Promise<UserWrappedResponse> {
    const { clientSeed } = body;
    return await this.userService.setClientSeed(user, clientSeed);
  }
}
