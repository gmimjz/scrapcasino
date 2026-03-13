import type { Database } from '../../database';
import { sessions } from '../../database/schema';
import { SESSION_COOKIE_NAME } from '../../utils/consts';
import { InjectDatabase } from '../database/database.provider';
import { PublicUserResponse } from '../user/user.dto';
import { ChatMessageResponse } from './chat.dto';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { and, eq } from 'drizzle-orm';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.APP_URL, credentials: true },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(@InjectDatabase() private readonly db: Database) {}

  async handleConnection(socket: Socket) {
    const cookieHeader = socket.handshake.headers.cookie;
    const userId = await this.resolveUserId(cookieHeader);
    if (userId) {
      socket.join(userId);
    }
  }

  handleDisconnect(socket: Socket) {
    socket.rooms.forEach((room) => socket.leave(room));
  }

  emitMessageCreated(
    chatMessage: ChatMessageResponse,
    user: PublicUserResponse,
  ) {
    this.server.emit('chat:message:created', { chatMessage, user });
  }

  emitMessageDeleted(chatMessage: ChatMessageResponse) {
    this.server.emit('chat:message:deleted', { chatMessage });
  }

  emitUserMuted(userId: string, mutedUntil: Date | null) {
    this.server.to(userId).emit('chat:user:muted', { mutedUntil });
  }

  emitUserUnmuted(userId: string) {
    this.server.to(userId).emit('chat:user:unmuted', {});
  }

  private async resolveUserId(
    cookieHeader: string | undefined,
  ): Promise<string | null> {
    if (!cookieHeader) return null;

    const cookies: Record<string, string> = Object.fromEntries(
      cookieHeader.split('; ').map((c) => c.split('=')),
    );
    const sessionId = cookies[SESSION_COOKIE_NAME];

    const [session] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId)));

    return session?.userId ?? null;
  }
}
