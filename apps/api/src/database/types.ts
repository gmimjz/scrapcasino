import {
  chatMessages,
  crateItems,
  crates,
  items,
  sessions,
  users,
} from './schema';
import { InferSelectModel } from 'drizzle-orm';

export enum Role {
  Admin = 'admin',
  Mod = 'mod',
  User = 'user',
}

export type User = InferSelectModel<typeof users>;

export type Session = InferSelectModel<typeof sessions>;

export type ChatMessage = InferSelectModel<typeof chatMessages>;

export type Crate = InferSelectModel<typeof crates>;

export type Item = InferSelectModel<typeof items>;

export type CrateItem = InferSelectModel<typeof crateItems>;
