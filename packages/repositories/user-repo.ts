import { type DatabaseOptions, getDatabaseContext, Schema } from '../db';
import {
	ORDER_DIRECTION,
	type OrderingParams,
	type PagingParams,
	type PagingResult,
	type User,
	type UserRole,
} from '../domains';
import { buildPagingResult } from '../domains/helpers';
import { and, count, eq, ilike, isNull } from 'drizzle-orm';

type UserQueryRow = typeof Schema.users.$inferSelect;
type UserSearch = Partial<Pick<User, 'name' | 'email' | 'firstName' | 'lastName'>>;

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
			company: row.company,
			role: row.role as UserRole,
			status: row.isActive,
			image: row.image,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			deletedAt: row.deletedAt,
		};
	}

	async findById(id: string, options?: DatabaseOptions): Promise<User | null> {
		const db = getDatabaseContext(options);
		const row = await db.query.users.findFirst({
			where: {
				id,
				deletedAt: { isNull: true },
			},
		});

		if (!row) return null;
		return this.mapToEntity(row);
	}

	async findByEmail(
		email: string,
		options?: DatabaseOptions,
	): Promise<User | null> {
		const db = getDatabaseContext(options);
		const row = await db.query.users.findFirst({
			where: {
				email,
				deletedAt: { isNull: true },
			},
		});

		if (!row) return null;
		return this.mapToEntity(row);
	}

	async findAll(
		paging: PagingParams,
		ordering: OrderingParams<User>,
		search?: UserSearch,
		options?: DatabaseOptions,
	): Promise<PagingResult<User>> {
		const db = getDatabaseContext(options);
		const whereClause = and(
			isNull(this.table.deletedAt),
			search?.name ? ilike(this.table.name, `%${search.name}%`) : undefined,
			search?.email ? ilike(this.table.email, `%${search.email}%`) : undefined,
			search?.firstName
				? ilike(this.table.firstName, `%${search.firstName}%`)
				: undefined,
			search?.lastName
				? ilike(this.table.lastName, `%${search.lastName}%`)
				: undefined,
		);
		const orderByKey =
			ordering.orderBy as keyof typeof Schema.users.$inferSelect;
		const isAsc = ordering.orderDirection === ORDER_DIRECTION.ASC;

		const [rows, countResult] = await Promise.all([
			db.query.users.findMany({
				where: {
					deletedAt: { isNull: true },
					...(search?.name && { name: { ilike: `%${search.name}%` } }),
					...(search?.email && { email: { ilike: `%${search.email}%` } }),
					...(search?.firstName && {
						firstName: { ilike: `%${search.firstName}%` },
					}),
					...(search?.lastName && {
						lastName: { ilike: `%${search.lastName}%` },
					}),
				},
				orderBy: (users, { asc, desc }) =>
					isAsc ? asc(users[orderByKey]) : desc(users[orderByKey]),
				limit: paging.perPage,
				offset: (paging.page - 1) * paging.perPage,
			}),
			//Count total
			db.select({ total: count() }).from(this.table).where(whereClause),
		]);

		return buildPagingResult(
			rows.map((row) => this.mapToEntity(row)),
			Number(countResult[0]?.total ?? 0),
			paging,
		);
	}

	async update(
		id: string,
		data: Partial<typeof Schema.users.$inferInsert>,
		options?: DatabaseOptions,
	): Promise<User | null> {
		const db = getDatabaseContext(options);
		//Update user
		const rows = await db
			.update(this.table)
			.set({ ...data, updatedAt: new Date() })
			.where(and(eq(this.table.id, id), isNull(this.table.deletedAt)))
			.returning();

		if (rows.length === 0) return null;
		return this.findById(id, options);
	}

	async delete(
		id: string,
		_deletedBy: string,
		options?: DatabaseOptions,
	): Promise<void> {
		const db = getDatabaseContext(options);
		const existing = await this.findById(id, options);
		if (!existing) return;

		await db.transaction(async (tx) => {
			const deletedAt = new Date();

			await tx
				.update(this.table)
				.set({
					email: `${existing.email}-deleted-${Date.now()}`,
					deletedAt,
					updatedAt: deletedAt,
				})
				.where(and(eq(this.table.id, id), isNull(this.table.deletedAt)));

			await tx.delete(Schema.sessions).where(eq(Schema.sessions.userId, id));
			await tx.delete(Schema.accounts).where(eq(Schema.accounts.userId, id));
		});
	}
}