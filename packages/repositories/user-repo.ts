import { Schema } from '../db';
import {
	ORDER_DIRECTION,
	type OrderingParams,
	type PagingParams,
	type PagingResult,
	type User,
} from '../domains';
import { buildPagingResult } from '../domains/helpers';
import { and, count, eq, ilike, isNull } from 'drizzle-orm';

type UserQueryRow = typeof Schema.users.$inferSelect;

export class UserRepository {
	private readonly table = Schema.users;


	mapToEntity(row: UserQueryRow): User {
		return {
			id: row.id,
			name: row.name,
			firstName: row.firstName,
			lastName: row.lastName,
			email: row.email,
			emailVerified: row.emailVerified,
			image: row.image,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			deletedAt: row.deletedAt,
		};
	}
}