import type { Database } from '../../database';
import { chatMessages, users } from '../../database/schema';
import { Role, User } from '../../database/types';
import { InjectDatabase } from '../database/database.provider';
import { PublicUserResponse, UserResponse } from '../user/user.dto';
import {
  ChatMessageResponse,
  ChatMessageWrappedResponse,
  GetMessagesResponse,
  UserWrappedResponse,
} from './chat.dto';
import { ChatGateway } from './chat.gateway';
import { CHAT_MESSAGES_LIMIT } from './consts';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, inArray, SQL } from 'drizzle-orm';

@Injectable()
export class ChatService {
  constructor(
    @InjectDatabase() private readonly db: Database,
    private readonly chatGateway: ChatGateway,
  ) {}

  async getMessages(user?: User): Promise<GetMessagesResponse> {
    const where: SQL[] = [];

    if (!user || user.role === Role.User) {
      where.push(eq(chatMessages.isRemoved, false));
    }

    const chatMessageObjects = await this.db
      .select()
      .from(chatMessages)
      .where(and(...where))
      .orderBy(desc(chatMessages.createdAt))
      .limit(CHAT_MESSAGES_LIMIT);

    const userIds = [
      ...new Set(chatMessageObjects.map((chatMessage) => chatMessage.userId)),
    ];

    const userObjects = await this.db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

    if (!user || user.role === Role.User) {
      return {
        chatMessages: chatMessageObjects.map(
          (chatMessage) => new ChatMessageResponse(chatMessage),
        ),
        users: userObjects.map((user) => new PublicUserResponse(user)),
      };
    } else {
      return {
        chatMessages: chatMessageObjects.map(
          (chatMessage) => new ChatMessageResponse(chatMessage),
        ),
        users: userObjects.map((user) => new UserResponse(user)),
      };
    }
  }

  async sendMessage(
    user: User,
    message: string,
  ): Promise<ChatMessageWrappedResponse> {
    if (user.mutedUntil && user.mutedUntil > new Date()) {
      throw new ForbiddenException('You are muted');
    }

    const [chatMessage] = await this.db
      .insert(chatMessages)
      .values({ userId: user.id, message })
      .returning();

    const chatMessageResponse = new ChatMessageResponse(chatMessage);
    this.chatGateway.emitMessageCreated(
      chatMessageResponse,
      new PublicUserResponse(user),
    );
    return { chatMessage: chatMessageResponse };
  }

  async deleteMessage(id: string): Promise<ChatMessageWrappedResponse> {
    const [chatMessage] = await this.db
      .update(chatMessages)
      .set({ isRemoved: true })
      .where(and(eq(chatMessages.id, id)))
      .returning();
    if (!chatMessage) {
      throw new NotFoundException('Message not found');
    }

    const chatMessageResponse = new ChatMessageResponse(chatMessage);
    this.chatGateway.emitMessageDeleted(chatMessageResponse);
    return { chatMessage: chatMessageResponse };
  }

  async muteUser(
    userId: string,
    duration: number,
  ): Promise<UserWrappedResponse> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ mutedUntil: new Date(Date.now() + duration * 1000) })
      .where(and(eq(users.id, userId)))
      .returning();

    this.chatGateway.emitUserMuted(userId, updatedUser.mutedUntil);
    return { user: new UserResponse(updatedUser) };
  }

  async unmuteUser(userId: string): Promise<UserWrappedResponse> {
    const [updatedUser] = await this.db
      .update(users)
      .set({ mutedUntil: null })
      .where(and(eq(users.id, userId)))
      .returning();

    this.chatGateway.emitUserUnmuted(userId);
    return { user: new UserResponse(updatedUser) };
  }
}
