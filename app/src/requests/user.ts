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

export const changePasswordRequest = t.Object(
	{
		currentPassword: t.String({ minLength: 1 }),
		newPassword: t.String({ minLength: 8 }),
		confirmNewPassword: t.String({ minLength: 8 }),
	},
	{
		examples: [
			{
				currentPassword: 'password123',
				newPassword: 'newpassword123',
				confirmNewPassword: 'newpassword123',
			},
		],
	},
);

export const userStatusRequest = t.Object(
	{
		isActive: t.Boolean({ default: true }),
		banReason: t.Optional(t.String()),
	},
	{
		examples: [
			{
				isActive: true,
			},
			{
				isActive: false,
				banReason: 'This user is spamming',
			},
		],
	},
);