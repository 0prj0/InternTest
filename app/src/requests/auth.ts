import { t } from 'elysia';

export const signUpRequest = t.Object(
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
	},
	{
		examples: [
			{
				email: 'user@example.com',
				password: 'AaBb12345!',
				confirmPassword: 'AaBb12345!',
				firstName: 'John',
				lastName: 'Doe',
				company: 'Abc'
			},
		],
	},
);

export const signInRequest = t.Object(
	{
		email: t.String({ format: 'email' }),
		password: t.String({ minLength: 8 }),
		rememberMe: t.Optional(t.Boolean({ default: false })),
	},
	{
		examples: [
			{
				email: 'user@example.com',
				password: 'AaBb12345!',
				rememberMe: true,
			},
		],
	},
);

export const createUserRequest = t.Object(
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
)