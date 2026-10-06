import type { AnyPgColumn } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const users = t.pgTable(
  'users', 
  {
  id: t.text('id').primaryKey(),
	firstName: t.text('first_name'),
	lastName: t.text('last_name'),
	name: t.text('name').notNull(),
	email: t.text('email').notNull().unique(),
	emailVerified: t.boolean('email_verified').default(false).notNull(),
	role: t.text('role').default('user'),
  image: t.text('image'),
  createdAt: t.timestamp('created_at').notNull(),
	updatedAt: t.timestamp('updated_at')
		.$onUpdate(() => new Date())
		.notNull(),
	deletedAt: t.timestamp('deleted_at'),
});

export const sessions = t.pgTable(
	'sessions',
	{
		id: t.text('id').primaryKey(),
		expiresAt: t.timestamp('expires_at').notNull(),
		token: t.text('token').notNull().unique(),
		ipAddress: t.text('ip_address'),
		userAgent: t.text('user_agent'),
		userId: t.text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: t.timestamp('created_at').notNull(),
		updatedAt: t.timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [t.index('sessions_user_id_idx').on(table.userId)],
);

export const accounts = t.pgTable(
	'accounts',
	{
		id: t.text('id').primaryKey(),
		accountId: t.text('account_id').notNull(),
		providerId: t.text('provider_id').notNull(),
		userId: t.text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: t.text('access_token'),
		refreshToken: t.text('refresh_token'),
		idToken: t.text('id_token'),
		accessTokenExpiresAt: t.timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: t.timestamp('refresh_token_expires_at'),
		scope: t.text('scope'),
		password: t.text('password'),
		createdAt: t.timestamp('created_at').notNull(),
		updatedAt: t.timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [t.index('accounts_user_id_idx').on(table.userId)],
);

export const verifications = t.pgTable(
	'verifications',
	{
		id: t.text('id').primaryKey(),
		identifier: t.text('identifier').notNull(),
		value: t.text('value').notNull(),
		expiresAt: t.timestamp('expires_at').notNull(),
		createdAt: t.timestamp('created_at').notNull(),
		updatedAt: t.timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [t.index('verifications_identifier_idx').on(table.identifier)],
);