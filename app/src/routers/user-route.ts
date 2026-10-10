import type {
	OrderDirection,
	OrderingParams,
	UpdateUserRequest,
	User,
} from '../../../packages/domains';
import { Elysia } from 'elysia';
import {
	listUsersQuery,
	updateUserRequest,
	userIdParams,
} from '../requests/user';
import { authService, userService } from '../service-di';
import { createUserRequest } from '../requests/auth';
import { auth } from '../lib/auth';

export const userRoute = new Elysia({
	prefix: '/users',
	detail: { tags: ['Users'] },
})
    .derive(async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

		const user =
			session && (await userService.hasActiveUser(session.user.id))
				? session.user
				: null;

        return { user };
    })
	.post(
		'/',
		async ({ body, user, request, set }) => {
			if (!user) {
				set.status = 401;
				return { error: 'Unauthorized' };
			}
			if (user.role !== 'admin') {
				set.status = 403;
				return { error: 'Only administrators can perform this action' };
			}
			if (body.password !== body.confirmPassword) {
				set.status = 400;
				return { error: 'Password and confirmPassword do not match' };
			}
			const createdUser = await authService.createUserByAdmin(body, request.headers);
			set.status = 201;
			return createdUser;
		},
		{ body: createUserRequest },
	)
	.get(
		'/',
		async ({ query, user, set }) => {
			if (!user) {
				set.status = 401;
				return { error: 'Unauthorized' };
			}

			const paging = {
				page: Number(query.page),
				perPage: Number(query.perPage),
			};
			const order: OrderingParams<User> = {
				orderBy: query.orderBy as keyof User,
				orderDirection: query.orderDirection as OrderDirection,
			};
			const users = await userService.getAllUsers(paging, order);
			return users;
		},
		{
			query: listUsersQuery,
		},
	)
	.get(
		'/:id',
		async ({ params, user, set }) => {
			if (!user) {
				set.status = 401;
				return { error: 'Unauthorized' };
			}

			return userService.getUserById(params.id);
		},
		{
			params: userIdParams,
		},
	)
	.put(
		'/:id',
		async ({ params, body, user, set }) => {
			if (!user) {
				set.status = 401;
				return { error: 'Unauthorized' };
			}

			if (user.role !== 'admin') {
				set.status = 403;
				return { error: 'Only administrators can perform this action' };
			}

			return userService.updateUser(
				params.id,
				body as UpdateUserRequest,
				user.id,
			);
		},
		{
			params: userIdParams,
			body: updateUserRequest,
		},
	)
	.delete(
		'/:id',
		async ({ params, user, request, set }) => {
			if (!user) {
				set.status = 401;
				return { error: 'Unauthorized' };
			}

			if (user.role !== 'admin') {
				set.status = 403;
				return { error: 'Only administrators can perform this action' };
			}

			const result = await userService.deleteUser(params.id, user.id);

			if (result.deletedSelf) {
				const signOutResponse = await auth.api.signOut({
					headers: request.headers,
					asResponse: true,
				});
				const setCookie = signOutResponse.headers.get('set-cookie');
				if (setCookie) set.headers['set-cookie'] = setCookie;
			}

			set.status = 204;
			return null;
		},
		{
			params: userIdParams,
		},
	)
