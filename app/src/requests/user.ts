import { t } from 'elysia';
import { QueryPagingValidator } from './common-request';
export const userIdParams = t.Object({ id: t.String() });

export const listUsersQuery = QueryPagingValidator;

export const updateUserRequest = t.Object(
	{
		email: t.String({ format: 'email' }),
		password: t.String({
			minLength: 8,
			pattern:
				'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
			// At least
			// one lowercase letter,
			// one uppercase letter,
			// one digit,
			// one special character
		}),
		confirmPassword: t.String({
			minLength: 8,
			pattern:
				'^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
			// At least
			// one lowercase letter,
			// one uppercase letter,
			// one digit,
			// one special character
		}),
		firstName: t.String({ minLength: 1 }),
		lastName: t.String({ minLength: 1 }),
		company: t.String({ minLength: 1 }),
		role: t.Union([t.Literal('user'), t.Literal('admin')])
	},
	{
		examples: [
			{
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				company: 'Abc',
				role: 'user',
				password: 'AaBb12345!',
				confirmPassword: 'AaBb12345!',
			},
		],
	}
);
