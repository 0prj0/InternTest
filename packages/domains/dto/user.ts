export type SignInRequest = {
	email: string;
	password: string;
	rememberMe?: boolean;
};

export type SignUpRequest = {
	email: string;
	password: string;
	confirmPassword: string;
	firstName?: string;
	lastName?: string;
};