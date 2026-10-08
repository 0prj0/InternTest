import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DbSchema, Schema } from './schema/schema';
import { defineRelations } from 'drizzle-orm';
import { config } from '../infra';

const relations = defineRelations(Schema);
export const db = drizzle(config.DATABASE_URL, { relations });

type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DatabaseOptions = {
	tx?: DatabaseTransaction;
};

export function getDatabaseContext(options?: DatabaseOptions) {
	return options?.tx ?? db;
}

export { Schema };
export * from './schema';