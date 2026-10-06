export type UserRole = 'admin' | 'user';

export type User = {
	id: string;
	name: string;
	firstName?: string | null;
	lastName?: string | null;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date | null;
};
