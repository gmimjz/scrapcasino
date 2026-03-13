import { Database } from '../../src/database';
import { crates } from '../../src/database/schema';
import { Crate } from '../../src/database/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const createCrateFactory = (db: Database) => {
  return Factory.define<Crate>(({ onCreate }) => {
    onCreate(async (crate) => {
      const [insertedCrate] = await db.insert(crates).values(crate).returning();
      return insertedCrate;
    });

    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      imageUrl: faker.image.url(),
      cost: faker.finance.amount({ min: 1, max: 100, dec: 2 }),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};
