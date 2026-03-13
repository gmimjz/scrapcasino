import type { Database } from '../../database';
import { serverSeeds, users } from '../../database/schema';
import type { User } from '../../database/types';
import { STEAM_ID_BASE } from '../../utils/consts';
import { generateRandomSeed, sha256 } from '../../utils/functions';
import { InjectDatabase } from '../database/database.provider';
import { PublicUserResponse, UserResponse } from './user.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(@InjectDatabase() private readonly db: Database) {}

  getUser(user: User) {
    return { user: new UserResponse(user) };
  }

  async getUserById(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user: new PublicUserResponse(user) };
  }

  async setSteamTradeUrl(user: User, steamTradeUrl: string) {
    const partnerId = BigInt(
      new URL(steamTradeUrl).searchParams.get('partner') || '0',
    );
    const steamTradeUrlSteamId = STEAM_ID_BASE + partnerId;
    if (steamTradeUrlSteamId.toString() !== user.steamId) {
      throw new BadRequestException('Steam Trade URL does not belong to user');
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({ steamTradeUrl })
      .where(eq(users.id, user.id))
      .returning();

    return { user: new UserResponse(updatedUser) };
  }

  async rotateServerSeed(user: User) {
    const serverSeed = generateRandomSeed();
    const hashedServerSeed = await sha256(serverSeed);

    return await this.db.transaction(async (tx) => {
      await tx.insert(serverSeeds).values({ serverSeed, hashedServerSeed });
      const [updatedUser] = await tx
        .update(users)
        .set({ hashedServerSeed })
        .where(eq(users.id, user.id))
        .returning();

      return { user: new UserResponse(updatedUser) };
    });
  }

  async setClientSeed(user: User, clientSeed: string) {
    const [updatedUser] = await this.db
      .update(users)
      .set({ clientSeed })
      .where(eq(users.id, user.id))
      .returning();

    return { user: new UserResponse(updatedUser) };
  }
}
