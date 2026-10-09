import { auth as Auth } from "../../app/src/lib/auth"; // path to your Better Auth server instance
import type { SignInRequest, SignUpRequest, CreateUserRequest } from '../domains/dto/user';
import type { User } from '../domains/entities';
import type { UserRepository } from '../repositories/user-repo';
import { logger } from '../domains/utils';


export class AuthService {
	constructor(
		private readonly auth: typeof Auth,
        private readonly userRepo: UserRepository,
	) {}

    async signUp(input: SignUpRequest): Promise<User> {
        if (input.password !== input.confirmPassword) {
			throw new Error('Password and confirmPassword do not match');
		}

		const firstName = input.firstName?.trim() ?? '';
		const lastName = input.lastName?.trim() ?? '';
		const company = input.company?.trim() ?? '';
        if (!company) {
            throw new Error('Company cannot be blank');
        }
        const name = `${firstName} ${lastName}`.trim();
		if (!name) {
			throw new Error('First name and last name cannot both be blank');
		}
		
		try {
			const result = await this.auth.api.signUpEmail({
				body: {
					email: input.email,
					password: input.password,
					name,
					firstName,
					lastName,
				},
			});
			const user = await this.userRepo.update(result.user.id, {
				name,
				firstName,
				lastName,
				company,
			});
			if (!user) {
				throw new Error('Created user could not be updated');
			}
			return user;
        } catch (error: unknown) {
            const err = error as {
				statusCode?: number;
				status?: number;
				message?: string;
				body?: { code?: string; message?: string };
			};
            logger.error(error, 'SignUp error');
            if (err?.statusCode === 422 || err?.status === 422) {
				if (err.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
                    throw new Error('Email already registered');
                }
            }

            throw new Error(err?.body?.message ?? err?.message ?? 'Failed to create account');
        }
    } 

    async signIn(input: SignInRequest, headers: Headers): Promise<Response> {
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

            return response;
        } catch (error: unknown) {
            const err = error as {
				statusCode?: number;
				status?: number;
				message?: string;
				body?: { code?: string };
			};
			logger.error(error, 'SignIn error');
			//Check if email or password is incorrect
			if (err?.statusCode === 401 || err?.status === 401) {
				throw new Error('Invalid email or password');
			}
			throw new Error(err?.message ?? 'Failed to sign in');
        }
    }

    async signOut(headers: Headers) {
		try {
			return await this.auth.api.signOut({ headers, asResponse: true });
		} catch (error: unknown) {
            const err = error as {
				statusCode?: number;
				status?: number;
				message?: string;
			};
			logger.error(error, 'SignOut error');
			throw new Error(err?.message ?? 'Failed to sign out');
        }
    }

    async createUserByAdmin(input: CreateUserRequest, headers: Headers): Promise<User> {
        // 1. Ensure the requester is an active Admin
        const session = await this.auth.api.getSession({ headers });
        if (!session || session.user.role !== 'admin') {
            throw new Error('Unauthorized: Only administrators can perform this action');
        }

        const firstName = input.firstName?.trim() ?? '';
        const lastName = input.lastName?.trim() ?? '';
        const company = input.company?.trim() ?? '';
        if (!company) {
            throw new Error('Company cannot be blank');
        }
        const name = `${firstName} ${lastName}`.trim();
        if (!name) {
            throw new Error('First name and last name cannot both be blank');
        }

        try {
            // 2. Create user using Better Auth Admin API
            const result = await this.auth.api.createUser({
                body: {
                    email: input.email,
                    password: input.password,
                    name,
                    role: input.role ?? 'user',
                },
                headers,
            });

            // 3. Update extended profile fields in repository
            const user = await this.userRepo.update(result.user.id, {
                name,
                firstName,
                lastName,
                company,
                role: input.role ?? 'user',
                isActive: true,
            });

            if (!user) {
                throw new Error('Created user could not be updated in database');
            }

            return user;
        } catch (error: unknown) {
            const err = error as {
                statusCode?: number;
                status?: number;
                message?: string;
                body?: { code?: string; message?: string };
            };
            logger.error(error, 'CreateUserByAdmin error');

            if (err?.statusCode === 422 || err?.status === 422 || err?.body?.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
                throw new Error('Email already registered');
            }

            throw new Error(err?.body?.message ?? err?.message ?? 'Failed to create user');
        }
    }
}