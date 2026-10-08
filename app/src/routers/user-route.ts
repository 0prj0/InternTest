import type { OrderDirection, OrderingParams, User } from '../../../packages/domains';
import { Elysia } from 'elysia';
import {
	changePasswordRequest,
	listUsersQuery,
	updateUserRequest,
	userIdParams,
	userStatusRequest,
} from '../requests/user';
import { userService } from '../service-di';
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
	.get(
		'/',
		async ({ query, user, set }) => {
			if (!user) {
				set.status = 401;
				return { error: 'Unauthorized' };
			}

			const { name, email, firstName, lastName } = query;
			const paging = {
				page: Number(query.page),
				perPage: Number(query.perPage),
			};
			const order: OrderingParams<User> = {
				orderBy: query.orderBy as keyof User,
				orderDirection: query.orderDirection as OrderDirection,
			};
			const search = {
				name,
				email,
				firstName,
				lastName,
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

			return userService.updateUser(params.id, body, user.id);
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

			await userService.deleteUser(params.id, user.id);

			if (params.id === user.id) {
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
	// .post(
	// 	'/reset-password',
	// 	async ({ body, user, request: { headers } }) =>
	// 		userService.resetUserPassword(body, user.id, headers),
	// 	{
	// 		body: resetPasswordRequest,
	// 	},
	// )
	.patch(
		'/:id/status',
		async ({ params, body, user, set }) => {
			if (!user) {
				set.status = 401;
				return { error: 'Unauthorized' };
			}

			return userService.updateUserStatus(params.id, body, user.id);
		},
		{
			params: userIdParams,
			body: userStatusRequest,
		},
	);