import { Database } from '../../src/database';
import { items } from '../../src/database/schema';
import { Item } from '../../src/database/types';
import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export const createItemFactory = (db: Database) => {
  return Factory.define<Item>(({ onCreate }) => {
    onCreate(async (item) => {
      const [insertedItem] = await db.insert(items).values(item).returning();
      return insertedItem;
    });

    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      imageUrl: faker.image.url(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
};
