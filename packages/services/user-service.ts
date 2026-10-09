import { auth as Auth } from "../../app/src/lib/auth";
import type { UserRepository } from '../repositories';
import type {
	ChangeUserPasswordRequest,
	UpdateUserRequest,
	UserStatusRequest,
} from '../domains/dto';
import type {
	OrderingParams,
	PagingParams,
	PagingResult,
	SuccessResponse,
	User,
} from '../domains/entities';
import { logger } from '../domains/utils';

export class UserService {
	constructor(
		private readonly auth: typeof Auth,
		private readonly userRepo: UserRepository,
	) {}

    async getUserById(id: string): Promise<User | null> {
        let user: User | null;

        try {
            user = await this.userRepo.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error: unknown) {
            const err = error as {
				statusCode?: number;
				status?: number;
				message?: string;
			};
            logger.error(error, 'GetUserById error');
            throw new Error('Failed to get user by id');
        }
    }

    async getAllUsers(
		paging: PagingParams,
		ordering: OrderingParams<User>,
	): Promise<PagingResult<User>> {
		try {
			const users = await this.userRepo.findAll(paging, ordering);
			return users;
		} catch (error: unknown) {
			const err = error as {
				statusCode?: number;
				status?: number;
				message?: string;
			};
			logger.error(error, 'GetAllUsers error');
			throw new Error(err?.message ?? 'Failed to get all users',);
		}
	}

	async hasActiveUser(id: string): Promise<boolean> {
		const user = await this.userRepo.findById(id);
		return user !== null && user.status;
	}

    async updateUser(
		id: string,
		data: UpdateUserRequest,
		sessionUserId: string,
	): Promise<User> {
		//Check if session user exists
		const sessionUser = await this.userRepo.findById(sessionUserId);
		if (!sessionUser) {
			throw new Error('Session user not found');
		}
		if (!sessionUser.status || sessionUser.role !== 'admin') {
			throw new Error('Only active administrators can perform this action');
		}
		//Check if user exists
		const user = await this.userRepo.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		const updateData: UpdateUserRequest & { name?: string } = { ...data };
		if ('firstName' in data || 'lastName' in data) {
			const firstName = data.firstName ?? user.firstName ?? '';
			const lastName = data.lastName ?? user.lastName ?? '';
			const name = `${firstName} ${lastName}`.trim();
			if (!name) {
				throw new Error('First name and last name cannot both be blank');
			}
			updateData.name = name;
		}
		//Update user
		try {
			const updatedUser = await this.userRepo.update(id, updateData);
			if (!updatedUser) {
				throw new Error('User not found');
			}
			return updatedUser;
		} catch (error: unknown) {
			const err = error as {
				statusCode?: number;
				status?: number;
				message?: string;
			};
			logger.error(error, 'UpdateUser error');
			throw new Error(err?.message ?? 'Failed to update user',);
		}
	}

    async deleteUser(id: string, sessionUserId: string): Promise<void> {
		//Check if user exists
		const user = await this.userRepo.findById(id);
		if (!user) {
			throw new Error('User not found');
		}
		//Check if session user exists
		const sessionUser = await this.userRepo.findById(sessionUserId);
		if (!sessionUser) {
			throw new Error('Session user not found');
		}
		if (!sessionUser.status || sessionUser.role !== 'admin') {
			throw new Error('Only active administrators can perform this action');
		}
		//Delete user
		try {
			await this.userRepo.delete(id, sessionUserId);
		} catch (error: unknown) {
			const err = error as {
				statusCode?: number;
				status?: number;
				message?: string;
			};
			logger.error(error, 'DeleteUser error');
			throw new Error(err?.message ?? 'Failed to delete user',);
		}
	}
}