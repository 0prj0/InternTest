import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Schema } from './schema/schema';

export const db = drizzle(process.env.DATABASE_URL!);

export { Schema };
export * from './schema';