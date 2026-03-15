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
  OpenCrateResponse,
} from './crate.dto';
import { hmacToRoll, selectItem } from './utils';
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

  async openCrate(
    user: User,
    crateId: string,
    count: number,
  ): Promise<OpenCrateResponse> {
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
      throw new InternalServerErrorException('Crate items chances are invalid');
    }

    const wonItems = await this.db.transaction(async (tx) => {
      const [userObject] = await tx
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .for('update');
      if (!userObject) {
        throw new NotFoundException('User not found');
      }

      const totalCost = crate.cost * count;
      if (userObject.balance < totalCost) {
        throw new BadRequestException('Insufficient balance');
      }

      const [serverSeedObject] = await tx
        .select()
        .from(serverSeeds)
        .where(eq(serverSeeds.hashedServerSeed, user.hashedServerSeed));
      if (!serverSeedObject) {
        throw new InternalServerErrorException('Server seed not found');
      }

      const hmacs = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          hmacSha256(
            serverSeedObject.serverSeed,
            `${userObject.clientSeed}:${userObject.nonce + i}`,
          ),
        ),
      );

      const wonItems = hmacs.map((hmac) => selectItem(hmacToRoll(hmac), items));
      const totalWonValue = wonItems.reduce((sum, { value }) => sum + value, 0);

      await tx
        .update(users)
        .set({
          balance: sql`${users.balance} - ${totalCost}::integer + ${totalWonValue}::integer`,
          xp: sql`${users.xp} + ${totalCost}::integer`,
          nonce: userObject.nonce + count,
        })
        .where(eq(users.id, user.id));

      await tx.insert(crateHistory).values(
        wonItems.map((wonItem, i) => ({
          userId: user.id,
          crateId,
          itemId: wonItem.itemId,
          serverSeed: serverSeedObject.serverSeed,
          clientSeed: userObject.clientSeed,
          nonce: userObject.nonce + i,
        })),
      );

      return wonItems;
    });

    return { items: wonItems.map((item) => new CrateItemResponse(item)) };
  }
}
