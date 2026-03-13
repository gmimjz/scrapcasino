import { Database } from '../src/database';
import {
  chatMessages,
  crateHistory,
  crateItems,
  crates,
  items,
  serverSeeds,
  sessions,
  users,
} from '../src/database/schema';
import { SESSION_COOKIE_NAME } from '../src/utils/consts';

export const clearDatabase = async (db: Database) => {
  await db.delete(chatMessages);
  await db.delete(crateHistory);
  await db.delete(crateItems);
  await db.delete(crates);
  await db.delete(items);
  await db.delete(serverSeeds);
  await db.delete(sessions);
  await db.delete(users);
};

export const createCookie = (sessionId: string) => {
  return `${SESSION_COOKIE_NAME}=${sessionId}`;
};
