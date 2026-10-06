import { auth as Auth } from "../../app/src/lib/auth"; // path to your Better Auth server instance
import type { SignInRequest, SignUpRequest } from '../domains/dto/user';
//import type { UserRepository } from '../repositories/user-repo';


export class AuthService {
	constructor(
		private readonly auth: typeof Auth,
        //private readonly userRepo: UserRepository,
	) {}

    async signUp(input: SignUpRequest) {
        if (input.password !== input.confirmPassword) {
			throw new Error('Password and confirmPassword do not match');
		}
		
		try {
			const result = await this.auth.api.signUpEmail({
				body: {
					email: input.email,
					password: input.password,
					name: `${input.firstName ?? ''} ${input.lastName ?? ''}`.trim(),
				},
			});
        } catch (error: unknown) {
            const err = error as any;
            const status = err?.status ?? err?.statusCode;
            const code = err?.body?.code ?? err?.code;

            if (status === 400 || status === 409 || status === 422 || code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
                throw new Error('Email already registered');
            }

            throw new Error(err?.body?.message ?? err?.message ?? 'Failed to create account');
        }
    } 

    async signIn(input: SignInRequest, headers: Headers) {
		// Check if user is already signed in
		const existingSession = await this.auth.api.getSession({ headers });
		if (existingSession) {
			throw new Error('User is already signed in.');
		}

        try {
            const response = await this.auth.api.signInEmail({
                body: {
                    email: input.email,
					password: input.password,
					rememberMe: input.rememberMe ?? false,
                },
                asResponse: true // returns a response object instead of data
            });
        } catch (error: unknown) {
            const err = error as any;
            const status = err?.status ?? err?.statusCode;
            
            if (status === 400 || status === 401) {
                throw new Error('Invalid email or password');
            }

            throw new Error(err?.message ?? 'Failed to sign in');
        }
    }

    async signOut(headers: Headers) {
        const session = await this.auth.api.getSession({ headers });
		if (!session) {
			throw new Error('No active session found');
		}
		try {
			//Sign out user
			const result = await this.auth.api.signOut({ headers, asResponse: true });
			return result;
		} catch (error: unknown) {
            const err = error as any;
            throw new Error(err?.message ?? 'Failed to sign out');
        }
    }
}