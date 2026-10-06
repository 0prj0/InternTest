export const ORDER_DIRECTION: Record<string, string> = {
	ASC: 'asc',
	DESC: 'desc',
} as const;

export type PagingParams = {
	perPage: number;
	page: number;
};

export type PagingResult<T> = {
	data: T[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
};

export type OrderDirection =
	(typeof ORDER_DIRECTION)[keyof typeof ORDER_DIRECTION];

export type OrderingParams<T> = {
	orderBy: keyof T;
	orderDirection: OrderDirection;
};

export type SearchParams<T> = {
	[K in keyof T]?: string;
};

export type SuccessResponse = {
	isSuccess: boolean;
	message?: string;
};