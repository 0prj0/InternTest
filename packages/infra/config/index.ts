function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) throw new Error(`Missing required environment variable: ${key}`);
	return value;
}

export const config = {
	PROJECT_NAME: process.env.PROJECT_NAME ?? 'Backend Whitelabel API',
	PORT: Number(process.env.PORT ?? 3001),
	API_BASE_URL: process.env.API_BASE_URL ?? 'http://localhost:3001',
	DATABASE_URL: requireEnv('DATABASE_URL'),
	BETTER_AUTH_SECRET: requireEnv('BETTER_AUTH_SECRET'),
	AUTH_TRUSTED_ORIGINS: process.env.AUTH_TRUSTED_ORIGINS
		? process.env.AUTH_TRUSTED_ORIGINS.split(',').map((s) => s.trim())
		: true,
} as const;