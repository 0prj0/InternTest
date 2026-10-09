import { t } from 'elysia';
import { QueryPagingValidator } from './common-request';
export const userIdParams = t.Object({ id: t.String() });

export const listUsersQuery = QueryPagingValidator;

export const updateUserRequest = t.Object(
	{
		firstName: t.Optional(t.String()),
		lastName: t.Optional(t.String()),
		image: t.Optional(t.String()),
	},
	{
		examples: [
			{
				firstName: 'John',
				lastName: 'Doe',
				image: 'https://example.com/image.jpg',
			},
		],
	},
);
