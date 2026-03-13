import type { Database } from '../../database';
import {
  crateHistory,
  crateItems,
  crates,
  items,
  serverSeeds,
  users,
} from '../../database/schema';
import type { User } from '../../database/types';
import { hmacSha256 } from '../../utils/functions';
import { InjectDatabase } from '../database/database.provider';
import {
  CrateItemResponse,
  CrateResponse,
  GetCrateResponse,
  GetCratesResponse,
  ItemResponse,
} from './crate.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq, inArray, sql } from 'drizzle-orm';

@Injectable()
export class CrateService {
  constructor(@InjectDatabase() private readonly db: Database) {}

  async getCrates(): Promise<GetCratesResponse> {
    const crateObjects = await this.db.select().from(crates);

    return { crates: crateObjects.map((crate) => new CrateResponse(crate)) };
  }

  async getCrate(id: string): Promise<GetCrateResponse> {
    const [crate] = await this.db
      .select()
      .from(crates)
      .where(eq(crates.id, id));
    if (!crate) {
      throw new NotFoundException('Crate not found');
    }

    const crateItemObjects = await this.db
      .select()
      .from(crateItems)
      .where(eq(crateItems.crateId, id));

    const itemObjects = await this.db
      .select()
      .from(items)
      .where(
        inArray(
          items.id,
          crateItemObjects.map((crateItem) => crateItem.itemId),
        ),
      );

    return {
      crate: new CrateResponse(crate),
      crateItems: crateItemObjects.map(
        (crateItem) => new CrateItemResponse(crateItem),
      ),
      items: itemObjects.map((item) => new ItemResponse(item)),
    };
  }

  async openCrate(user: User, crateId: string): Promise<CrateItemResponse> {
    const [crate] = await this.db
      .select()
      .from(crates)
      .where(eq(crates.id, crateId));
    if (!crate) {
      throw new NotFoundException('Crate not found');
    }

    const items = await this.db
      .select()
      .from(crateItems)
      .where(eq(crateItems.crateId, crateId))
      .orderBy(desc(crateItems.value));
    if (!items.length) {
      throw new BadRequestException('Crate has no items');
    }

    const totalChance = items.reduce((sum, item) => sum + item.chance, 0);
    if (totalChance !== 10000) {
      throw new InternalServerErrorException('Crate item chances');
    }

    const [serverSeedObject] = await this.db
      .select()
      .from(serverSeeds)
      .where(eq(serverSeeds.hashedServerSeed, user.hashedServerSeed));

    const { serverSeed } = serverSeedObject;
    const { clientSeed, nonce } = user;

    const hmac = await hmacSha256(serverSeed, `${clientSeed}:${nonce}`);
    const roll = Math.floor(
      (parseInt(hmac.slice(0, 8), 16) / 0x100000000) * 10000,
    );

    let cumulative = 0;
    let wonItem = items[items.length - 1];
    for (const item of items) {
      cumulative += item.chance;
      if (roll < cumulative) {
        wonItem = item;
        break;
      }
    }

    await this.db.transaction(async (tx) => {
      const [userObject] = await tx
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .for('update');
      if (!userObject) {
        throw new NotFoundException('User not found');
      }

      if (parseFloat(userObject.balance) < parseFloat(crate.cost)) {
        throw new BadRequestException('Insufficient balance');
      }

      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} - ${crate.cost}::decimal + ${wonItem.value}::decimal`,
          xp: sql`${users.xp} + ${Math.round(+crate.cost * 100)}::integer`,
          nonce: nonce + 1,
        })
        .where(eq(users.id, user.id));

      await tx.insert(crateHistory).values({
        userId: user.id,
        crateId,
        itemId: wonItem.itemId,
        serverSeed,
        clientSeed,
        nonce,
      });
    });

    return new CrateItemResponse(wonItem);
  }
}
