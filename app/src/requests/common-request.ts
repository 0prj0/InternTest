import { t } from 'elysia';
import { ORDER_DIRECTION } from '../../../packages/domains/entities/common';

export const QueryPagingValidator = t.Object({
	page: t.Number({ default: 1 }),
	perPage: t.Number({ default: 10 }),
	orderBy: t.String({ default: 'createdAt' }),
	orderDirection: t.Enum(ORDER_DIRECTION, { default: ORDER_DIRECTION.DESC }),
});

export const IdValidator = t.Object({
	id: t.String(),
});