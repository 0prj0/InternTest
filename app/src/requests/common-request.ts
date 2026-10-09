import { t } from 'elysia';
import { ORDER_DIRECTION } from '../../../packages/domains/entities/common';

export const QueryPagingValidator = t.Object({
	page: t.Integer({ minimum: 1, default: 1 }),
	perPage: t.Integer({ minimum: 1, maximum: 100, default: 10 }),
	orderBy: t.Union(['createdAt', 'updatedAt', 'name', 'email', 'firstName', 'lastName'].map((field) => t.Literal(field)), { default: 'createdAt' }),
	orderDirection: t.Enum(ORDER_DIRECTION, { default: ORDER_DIRECTION.DESC }),
});

export const IdValidator = t.Object({
	id: t.String(),
});