import dotenv from 'dotenv';

dotenv.config();

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set in the environment variables');
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
