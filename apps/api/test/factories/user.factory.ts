import { Database } from '../../src/database';
import { serverSeeds, sessions, users } from '../../src/database/schema';
import { Role, Session, User } from '../../src/database/types';
import { SESSION_TTL, STEAM_ID_BASE } from '../../src/utils/consts';
import { generateRandomSeed, sha256 } from '../../src/utils/functions';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

type UserWithSession = User & {
  session?: Session;
};

export const createUserFactory = (db: Database) => {
  return Factory.define<UserWithSession>(({ onCreate }) => {
    onCreate(async (user) => {
      const serverSeed = generateRandomSeed();
      const hashedServerSeed = await sha256(serverSeed);

      const [insertedUser] = await db
        .insert(users)
        .values({
          ...user,
          hashedServerSeed,
        })
        .returning();

      const [session] = await db
        .insert(sessions)
        .values({
          userId: insertedUser.id,
          expires: new Date(+new Date() + SESSION_TTL * 1000),
        })
        .returning();

      await db.insert(serverSeeds).values({
        serverSeed,
        hashedServerSeed,
      });

      return { ...insertedUser, session };
    });

    const partner = faker.number.int({ min: 0, max: 1000000000 });
    const steamId = (STEAM_ID_BASE + BigInt(partner)).toString();

    return {
      id: faker.string.uuid(),
      username: faker.internet.username(),
      steamId,
      avatarUrl: faker.image.url(),
      xp: faker.number.int({ min: 0, max: 1000 }),
      balance: faker.number.int({ min: 0, max: 100000 }),
      role: Role.User,
      mutedUntil: null,
      steamTradeUrl: `https://steamcommunity.com/tradeoffer/new/?partner=${partner}&token=${faker.string.alphanumeric(8)}`,
      hashedServerSeed: faker.string.alphanumeric(64),
      clientSeed: faker.string.alphanumeric(32),
      nonce: faker.number.int({ min: 0, max: 1000 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};
