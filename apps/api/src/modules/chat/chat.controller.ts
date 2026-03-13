import { Role, type User } from '../../database/types';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { IsPublic } from '../../decorators/is-public.decorator';
import { Roles } from '../../decorators/roles.decorator';
import {
  ChatMessageWrappedResponse,
  GetMessagesResponse,
  MuteUserBody,
  SendMessageBody,
  UserWrappedResponse,
} from './chat.dto';
import { ChatService } from './chat.service';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

@Controller('chat')
@UseInterceptors(ClassSerializerInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/messages')
  @IsPublic()
  async getMessages(@CurrentUser() user?: User): Promise<GetMessagesResponse> {
    return await this.chatService.getMessages(user);
  }

  @Post('/message')
  async sendMessage(
    @CurrentUser() user: User,
    @Body() body: SendMessageBody,
  ): Promise<ChatMessageWrappedResponse> {
    const { message } = body;
    return await this.chatService.sendMessage(user, message);
  }

  @Delete('/message/:id')
  @Roles(Role.Admin, Role.Mod)
  async deleteMessage(
    @Param('id') id: string,
  ): Promise<ChatMessageWrappedResponse> {
    return await this.chatService.deleteMessage(id);
  }

  @Post('/mute/:userId')
  @Roles(Role.Admin, Role.Mod)
  async muteUser(
    @Body() body: MuteUserBody,
    @Param('userId') userId: string,
  ): Promise<UserWrappedResponse> {
    const { duration } = body;
    return await this.chatService.muteUser(userId, duration);
  }

  @Post('/unmute/:userId')
  @Roles(Role.Admin, Role.Mod)
  async unmuteUser(
    @Param('userId') userId: string,
  ): Promise<UserWrappedResponse> {
    return await this.chatService.unmuteUser(userId);
  }
}
