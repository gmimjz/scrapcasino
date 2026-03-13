import type { Database } from '../database';
import { sessions, users } from '../database/schema';
import { User } from '../database/types';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';
import { InjectDatabase } from '../modules/database/database.provider';
import { SESSION_COOKIE_NAME } from '../utils/consts';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq, gt, and } from 'drizzle-orm';
import { FastifyRequest } from 'fastify';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectDatabase() private readonly db: Database,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const sessionId = request.cookies?.[SESSION_COOKIE_NAME];
    const user = await this.resolveUser(sessionId);

    if (!user) {
      if (isPublic) return true;

      throw new UnauthorizedException('Session not found');
    }

    request.user = user;
    return true;
  }

  private async resolveUser(sessionId?: string): Promise<User | null> {
    if (!sessionId) return null;

    const [session] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), gt(sessions.expires, new Date())));
    if (!session) return null;

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, session.userId));
    if (!user) return null;

    return user;
  }
}
