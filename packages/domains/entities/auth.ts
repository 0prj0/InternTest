import type { User } from './user';

export type Session = {
	user: User;
	session: { id: string };
};