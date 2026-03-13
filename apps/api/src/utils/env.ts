import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

if (!process.env.PORT) {
  throw new Error('PORT is not set in the environment variables');
}

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set in the environment variables');
}

if (!process.env.STEAM_API_KEY) {
  throw new Error('STEAM_API_KEY is not set in the environment variables');
}

if (!process.env.APP_URL) {
  throw new Error('APP_URL is not set in the environment variables');
}

if (!process.env.API_URL) {
  throw new Error('API_URL is not set in the environment variables');
}

export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = +process.env.PORT;
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const STEAM_API_KEY = process.env.STEAM_API_KEY;
export const APP_URL = process.env.APP_URL;
export const API_URL = process.env.API_URL;
