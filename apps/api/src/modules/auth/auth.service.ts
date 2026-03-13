import type { Database } from '../../database';
import { serverSeeds, sessions, users } from '../../database/schema';
import { User } from '../../database/types';
import { SESSION_COOKIE_NAME, SESSION_TTL } from '../../utils/consts';
import { APP_URL, PORT, STEAM_API_KEY } from '../../utils/env';
import { generateRandomSeed, sha256 } from '../../utils/functions';
import type { ISteamUserResponse } from '../../utils/steam';
import { InjectDatabase } from '../database/database.provider';
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { FastifyReply } from 'fastify';
import querystring from 'querystring';

@Injectable()
export class AuthService {
  constructor(@InjectDatabase() private readonly db: Database) {}

  async login() {
    const params = {
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': `http://localhost:${PORT}/auth/return`,
      'openid.realm': `http://localhost:${PORT}`,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
    };

    return {
      url: `https://steamcommunity.com/openid/login?${querystring.stringify(params)}`,
    };
  }

  async return(reply: FastifyReply, openIdData: Record<string, string>) {
    const response = await fetch('https://steamcommunity.com/openid/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: querystring.stringify({
        ...openIdData,
        'openid.mode': 'check_authentication',
      }),
    });
    const data = await response.text();
    if (!data.includes('is_valid:true')) {
      return { url: '/' };
    }

    const claimedId = openIdData['openid.claimed_id'];
    if (!claimedId) {
      return { url: '/' };
    }
    const steamIdMatch = claimedId.match(
      /https:\/\/steamcommunity.com\/openid\/id\/(\d+)/,
    );
    if (!steamIdMatch) {
      return { url: '/' };
    }

    const steamId = claimedId.replace(
      'https://steamcommunity.com/openid/id/',
      '',
    );
    const steamResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`,
    );
    const steamData: ISteamUserResponse = await steamResponse.json();

    const clientSeed = generateRandomSeed();
    const serverSeed = generateRandomSeed();
    const hashedServerSeed = await sha256(serverSeed);

    await this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          steamId,
          username: steamData.response.players[0].personaname,
          avatarUrl: steamData.response.players[0].avatarfull,
          clientSeed,
          hashedServerSeed,
        })
        .onConflictDoUpdate({
          target: users.steamId,
          set: {
            username: steamData.response.players[0].personaname,
            avatarUrl: steamData.response.players[0].avatarfull,
          },
        })
        .returning();
      const [session] = await tx
        .insert(sessions)
        .values({
          userId: user.id,
          expires: new Date(+new Date() + SESSION_TTL * 1000),
        })
        .returning();
      await tx.insert(serverSeeds).values({
        serverSeed,
        hashedServerSeed,
      });

      reply.setCookie(SESSION_COOKIE_NAME, session.id, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: +SESSION_TTL,
      });
    });

    return { url: APP_URL };
  }

  async logout(reply: FastifyReply, user: User) {
    await this.db.transaction(async (tx) => {
      await tx.delete(sessions).where(eq(sessions.userId, user.id));

      reply.clearCookie(SESSION_COOKIE_NAME, {
        path: '/',
        sameSite: 'lax',
        httpOnly: true,
      });
    });
  }
}
