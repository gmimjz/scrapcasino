import { MAX_MESSAGE_LENGTH } from './consts';
import { Role } from './types';
import { pgEnum, varchar } from 'drizzle-orm/pg-core';
import { boolean } from 'drizzle-orm/pg-core';
import { decimal } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const roles = pgEnum('roles', Role);

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  steamId: varchar('steam_id').unique(),
  username: varchar().notNull(),
  avatarUrl: varchar('avatar_url'),
  xp: integer().notNull().default(0),
  balance: decimal({ precision: 10, scale: 2 }).notNull().default('0.00'),
  role: roles().notNull().default(Role.User),
  mutedUntil: timestamp('muted_until', { withTimezone: true }),
  steamTradeUrl: varchar('steam_trade_url'),
  hashedServerSeed: varchar('hashed_server_seed', { length: 64 }).notNull(),
  clientSeed: varchar('client_seed', { length: 64 }).notNull(),
  nonce: integer().notNull().default(0),
  ...timestamps,
});

export const sessions = pgTable('sessions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  expires: timestamp({ withTimezone: true }).notNull(),
  ...timestamps,
});

export const serverSeeds = pgTable('server_seeds', {
  id: uuid().primaryKey().defaultRandom(),
  serverSeed: varchar('server_seed', { length: 64 }).notNull(),
  hashedServerSeed: varchar('hashed_server_seed', { length: 64 }).notNull(),
  ...timestamps,
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  message: varchar({ length: MAX_MESSAGE_LENGTH }).notNull(),
  isRemoved: boolean('is_removed').notNull().default(false),
  ...timestamps,
});

export const crates = pgTable('crates', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar().notNull(),
  imageUrl: varchar('image_url').notNull(),
  cost: decimal({ precision: 10, scale: 2 }).notNull(),
  ...timestamps,
});

export const items = pgTable('items', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar().notNull(),
  imageUrl: varchar('image_url').notNull(),
  ...timestamps,
});

export const crateItems = pgTable('crate_items', {
  id: uuid().primaryKey().defaultRandom(),
  crateId: uuid('crate_id')
    .notNull()
    .references(() => crates.id),
  itemId: uuid('item_id')
    .notNull()
    .references(() => items.id),
  value: decimal({ precision: 10, scale: 2 }).notNull().default('0.00'),
  chance: integer().notNull().default(0),
  ...timestamps,
});

export const crateHistory = pgTable('crate_history', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  crateId: uuid('crate_id')
    .notNull()
    .references(() => crates.id),
  itemId: uuid('item_id')
    .notNull()
    .references(() => items.id),
  value: decimal({ precision: 10, scale: 2 }).notNull().default('0.00'),
  serverSeed: varchar('server_seed', { length: 64 }).notNull(),
  clientSeed: varchar('client_seed', { length: 64 }).notNull(),
  nonce: integer().notNull().default(0),
  ...timestamps,
});
