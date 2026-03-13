import { DATABASE_URL } from '../utils/env';
import { drizzle } from 'drizzle-orm/node-postgres';

const database = drizzle(DATABASE_URL);

export type Database = typeof database;

export default database;
