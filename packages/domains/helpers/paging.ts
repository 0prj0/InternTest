import type { PagingParams, PagingResult } from '../entities/common';

export function buildPagingResult<T>(
	data: T[],
	total: number,
	params: PagingParams,
): PagingResult<T> {
	return {
		data,
		total,
		page: params.page,
		perPage: params.perPage,
		totalPages: Math.ceil(total / params.perPage),
	};
}