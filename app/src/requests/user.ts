import { t } from 'elysia';
import { QueryPagingValidator } from './common-request';
export const userIdParams = t.Object({ id: t.String() });

export const listUsersQuery = t.Composite([
	QueryPagingValidator,
	t.Object({
		name: t.Optional(t.String()),
		email: t.Optional(t.String()),
		firstName: t.Optional(t.String()),
		lastName: t.Optional(t.String()),
	}),
]);

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
