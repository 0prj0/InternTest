export type UserRole = 'admin' | 'user';
export type status = boolean;

export type User = {
	id: string;
	name: string;
	firstName?: string | null;
	lastName?: string | null;
	email: string;
	emailVerified: boolean;
	image?: string | null;
	company: string | null;
	role: UserRole;
	status: boolean;
	banned?: boolean | null;
	banReason?: string | null;
	banExpires?: Date | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date | null;
};
