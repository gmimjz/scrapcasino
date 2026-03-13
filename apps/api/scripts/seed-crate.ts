import {
  crateHistory,
  crateItems,
  crates,
  items,
} from '../src/database/schema.js';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

const db = drizzle(process.env.DATABASE_URL);

const ITEMS = {
  'Big Grin': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fe5GLEfDY0jhyo8DEiv5daPq0_qrw_QfG9DKWskiE/330x192?allow_animated=1',
  },
  'Plate Carrier - Black': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fe5GbEfDY0jhyo8DEiv5dYPqE8qbMxQ_u3jJ6tMwQ/330x192?allow_animated=1',
  },
  'Stainless Facemask': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fe4WPBfDY0jhyo8DEiv5dYMKs4qbA0Q_253JbjYRw/330x192?allow_animated=1',
  },
  'Digital Camo MP5': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fe5GPEfDY0jhyo8DEiv5dYPK04rLY_Qfi-3hK4QNw/330x192?allow_animated=1',
  },
  'AK-47 Victoria': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835FZ4GLCfDY0jhyo8DEiv5dYOaw5qL00QP68qXrYZGE/330x192?allow_animated=1',
  },
  Jawboy: {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fc5mPEfDY0jhyo8DEiv5dYPKo9r7M-RfG-H1_vHNg/330x192?allow_animated=1',
  },
  'Panda Rug': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ff52PGfDY0jhyo8DEiv5dbO6k5rrU0Rf6_cimukZs/330x192?allow_animated=1',
  },
  'Rox Black Vending Machine': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ff5WPHfDY0jhyo8DEiv5dYMKo8r7IzR_-76sSb2tE/330x192?allow_animated=1',
  },
  'Grey Cap': {
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5GDDfDY0jhyo8DEiv5dYMK49rLc-Rv-2y0ejBN4/330x192?allow_animated=1',
  },
};

const CRATES = [
  {
    name: 'Black & White',
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrCfDY0jhyo8DEiv5daOaE5qbQ_RPm5dPBNsa8/330x192?allow_animated=1',
    cost: '4.60',
    items: [
      { name: 'Big Grin', value: '774.10', chance: 1 },
      { name: 'Plate Carrier - Black', value: '144.35', chance: 12 },
      { name: 'Stainless Facemask', value: '82.22', chance: 22 },
      { name: 'Digital Camo MP5', value: '74.48', chance: 50 },
      { name: 'AK-47 Victoria', value: '73.32', chance: 75 },
      { name: 'Jawboy', value: '46.54', chance: 125 },
      { name: 'Panda Rug', value: '42.21', chance: 160 },
      { name: 'Rox Black Vending Machine', value: '25.81', chance: 555 },
      { name: 'Grey Cap', value: '0.12', chance: 9000 },
    ],
  },
];

async function seed() {
  console.log('Resetting database...');

  await db.delete(crateHistory);
  await db.delete(crateItems);
  await db.delete(crates);
  await db.delete(items);

  console.log('Seeding database...');

  const insertedItems = await db
    .insert(items)
    .values(
      Object.entries(ITEMS).map(([name, { imageUrl }]) => ({ name, imageUrl })),
    )
    .returning();

  const itemIdByName = Object.fromEntries(
    insertedItems.map((i) => [i.name, i.id]),
  );
  console.log(`Inserted ${insertedItems.length} items`);

  for (const crateData of CRATES) {
    const [crate] = await db
      .insert(crates)
      .values({
        name: crateData.name,
        imageUrl: crateData.imageUrl,
        cost: crateData.cost,
      })
      .returning();

    console.log(`Inserted crate: ${crate.id} (${crate.name})`);

    const crateItemValues = crateData.items.map(({ name, value, chance }) => ({
      crateId: crate.id,
      itemId: itemIdByName[name],
      value,
      chance,
    }));

    const insertedCrateItems = await db
      .insert(crateItems)
      .values(crateItemValues)
      .returning();
    console.log(`Inserted ${insertedCrateItems.length} crate items`);
  }

  console.log('Done.');
  await db.$client.end();
}

seed();
