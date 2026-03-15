import { Database } from '../../src/database';
import { crateItems } from '../../src/database/schema';
import { CrateItem } from '../../src/database/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const createCrateItemFactory = (db: Database) => {
  return Factory.define<CrateItem>(({ onCreate }) => {
    onCreate(async (crateItem) => {
      const [insertedCrateItem] = await db
        .insert(crateItems)
        .values(crateItem)
        .returning();

      return insertedCrateItem;
    });

    return {
      id: faker.string.uuid(),
      crateId: faker.string.uuid(),
      itemId: faker.string.uuid(),
      value: faker.number.int({ min: 0, max: 10000 }),
      chance: 10000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};
