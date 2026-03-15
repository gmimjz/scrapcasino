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
  'Glory AK47': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fc5GLGfDY0jhyo8DEiv5daMag5qLU2QPi5ucQjeRg/330x192?allow_animated=1',
  },
  'Alien Red': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ff5GLNfDY0jhyo8DEiv5dbPK47pbcyR_m4lcnvtWQ/330x192?allow_animated=1',
  },
  'AK-47 From Hell': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835FY5GPEfDY0jhyo8DEiv5dfMKs_pLE1QfDY-JXvkg/330x192?allow_animated=1',
  },
  'AK Royale': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835FZ5mPEfDY0jhyo8DEiv5dbPaA_rLQ-Rv620HRQeGU/330x192?allow_animated=1',
  },
  'Tempered AK47': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5WHNfDY0jhyo8DEiv5dYO607rLc2Rv2_pCV1NYc/330x192?allow_animated=1',
  },
  'Mysic AK47': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835FY7WPFfDY0jhyo8DEiv5dbOaE2q700Qvq21B6Tcxg/330x192?allow_animated=1',
  },
  'Glorious AK': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fa4mLMfDY0jhyo8DEiv5dbOq82q7YzRPy3Y7PlDvI/330x192?allow_animated=1',
  },
  'Anubis Ak47': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fb7GLNfDY0jhyo8DEiv5ddOKA_qLQ3QfC3D0-WOGE/330x192?allow_animated=1',
  },
  'Christmas Lights': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5WfFfDY0jhyo8DEiv5ddOKo7rbUzQvq3LCmm_GA/330x192?allow_animated=1',
  },
  'Large Fireworks Pack': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5WXAfDY0jhyo8DEiv5dYOq48rbA1QPq6GVMAfSs/330x192?allow_animated=1',
  },
  'Small Fireworks Pack': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5WXDfDY0jhyo8DEiv5dbPqo4qLAwRPG2ntizXCA/330x192?allow_animated=1',
  },
  'Tempered Mp5': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fe5GrGfDY0jhyo8DEiv5dbMKg7qrI-R_25bLlcT1E/330x192?allow_animated=1',
  },
  'Tempered Mask': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fe5GrHfDY0jhyo8DEiv5dePqE9pbM-6tN-C0c/330x192?allow_animated=1',
  },
  'Tempered Python': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835FX52LGfDY0jhyo8DEiv5ddOKk-rLM0R_q6WHqsNRw/330x192?allow_animated=1',
  },
  'Tempered SAR': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835db52LAfDY0jhyo8DEiv5dQP6k-r7I-RPliDiz_hQ/330x192?allow_animated=1',
  },
  'Tempered Roadsign Vest': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835da42LNfDY0jhyo8DEiv5daP6A2qrYxQ_687je_51Q/330x192?allow_animated=1',
  },
  'Tempered Roadsign Pants': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835da42LCfDY0jhyo8DEiv5dYMK06pLQxR_2_zmPdVVM/330x192?allow_animated=1',
  },
  'Tempered Bow': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835dc7GLNfDY0jhyo8DEiv5deMak3rbIzQPlfZL1m6g/330x192?allow_animated=1',
  },
  'Tempered Crossbow': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835da5mLNfDY0jhyo8DEiv5dYO6g_qbE1RP255j8_XH8/330x192?allow_animated=1',
  },
  'Green Cap': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5GHFfDY0jhyo8DEiv5dYMKw6rrA_R_m_tNp0fwE/330x192?allow_animated=1',
  },
  Spacesuit: {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Je5WrFfDY0jhyo8DEiv5daPaw3r7A0Qvm4HHbB58c/330x192?allow_animated=1',
  },
  'Space Rocket Work Gloves': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fd5mLMfDY0jhyo8DEiv5daO6k4rbYySfi5hwE1dZk/330x192?allow_animated=1',
  },
  'Space Raider Rocket Launcher': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835dd52LCfDY0jhyo8DEiv5ddOag9pbUyQvG367Ztltg/330x192?allow_animated=1',
  },
  'Cobalt Space Door': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Fa7WPEfDY0jhyo8DEiv5daOas8rrAyQPi8klQ0xoM/330x192?allow_animated=1',
  },
  'Space Raider Pants': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835df7WLEfDY0jhyo8DEiv5dYOaw3qLYxRf69oaX99Os/330x192?allow_animated=1',
  },
  'Space Raider Hoodie': {
    imageUrl:
      'https://community.fastly.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835df7WLFfDY0jhyo8DEiv5daPq06pLMzSPq_A6teAjg/330x192?allow_animated=1',
  },
};

const CRATES = [
  {
    name: 'Black & White',
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrCfDY0jhyo8DEiv5daOaE5qbQ_RPm5dPBNsa8/330x192?allow_animated=1',
    cost: 460,
    items: [
      { name: 'Big Grin', value: 77410, chance: 1 },
      { name: 'Plate Carrier - Black', value: 14435, chance: 12 },
      { name: 'Stainless Facemask', value: 8222, chance: 22 },
      { name: 'Digital Camo MP5', value: 7448, chance: 50 },
      { name: 'AK-47 Victoria', value: 7332, chance: 75 },
      { name: 'Jawboy', value: 4654, chance: 125 },
      { name: 'Panda Rug', value: 4221, chance: 160 },
      { name: 'Rox Black Vending Machine', value: 2581, chance: 555 },
      { name: 'Grey Cap', value: 12, chance: 9000 },
    ],
  },
  {
    name: '5% AK',
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrCfDY0jhyo8DEiv5daOaE5qbQ_RPm5dPBNsa8/330x192?allow_animated=1',
    cost: 147,
    items: [
      { name: 'Glory AK47', value: 25877, chance: 2 },
      { name: 'Alien Red', value: 14432, chance: 15 },
      { name: 'AK-47 From Hell', value: 4031, chance: 33 },
      { name: 'AK Royale', value: 2943, chance: 70 },
      { name: 'Tempered AK47', value: 2139, chance: 80 },
      { name: 'Mysic AK47', value: 1718, chance: 85 },
      { name: 'Glorious AK', value: 1519, chance: 90 },
      { name: 'Anubis Ak47', value: 1505, chance: 125 },
      { name: 'Grey Cap', value: 8, chance: 9500 },
    ],
  },
  {
    name: 'Birthday',
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrCfDY0jhyo8DEiv5daOaE5qbQ_RPm5dPBNsa8/330x192?allow_animated=1',
    cost: 60,
    items: [
      { name: 'Christmas Lights', value: 9648, chance: 3 },
      {
        name: 'Large Fireworks Pack',
        value: 436,
        chance: 297,
      },
      {
        name: 'Small Fireworks Pack',
        value: 251,
        chance: 1300,
      },
      {
        name: 'Green Cap',
        value: 9,
        chance: 8400,
      },
    ],
  },
  {
    name: '70% Tempered',
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrCfDY0jhyo8DEiv5daOaE5qbQ_RPm5dPBNsa8/330x192?allow_animated=1',
    cost: 400,
    items: [
      { name: 'Tempered Mp5', value: 55776, chance: 1 },
      { name: 'Tempered Mask', value: 26041, chance: 1 },
      { name: 'Tempered AK47', value: 2910, chance: 28 },
      { name: 'Tempered Python', value: 1077, chance: 70 },
      { name: 'Tempered SAR', value: 678, chance: 400 },
      { name: 'Tempered Roadsign Vest', value: 616, chance: 500 },
      { name: 'Tempered Roadsign Pants', value: 591, chance: 1000 },
      { name: 'Tempered Bow', value: 456, chance: 2000 },
      { name: 'Tempered Crossbow', value: 419, chance: 3000 },
      { name: 'Green Cap', value: 9, chance: 3000 },
    ],
  },
  {
    name: 'Space Dream',
    imageUrl:
      'https://community.akamai.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byXi7vaVKyDk_zQLX05x6eLCFM9neAckxGDf7qU2e2gu64OnAeQ7835Ja5WrCfDY0jhyo8DEiv5daOaE5qbQ_RPm5dPBNsa8/330x192?allow_animated=1',
    cost: 280,
    items: [
      { name: 'Spacesuit', value: 24978, chance: 500 },
      { name: 'Space Rocket Work Gloves', value: 12489, chance: 250 },
      { name: 'Space Raider Rocket Launcher', value: 6244, chance: 1400 },
      { name: 'Cobalt Space Door', value: 12489, chance: 900 },
      { name: 'Space Raider Pants', value: 6244, chance: 1750 },
      { name: 'Space Raider Hoodie', value: 3122, chance: 2200 },
      { name: 'Green Cap', value: 9, chance: 3000 },
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
