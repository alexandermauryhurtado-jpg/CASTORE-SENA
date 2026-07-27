import { Response } from 'express';
import { PaginatedResult } from '../types';

export function successResponse(
  res: Response,
  data: unknown,
  message = 'Operación exitosa',
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function paginatedResponse<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Operación exitosa'
) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : Math.min(page * limit, total);

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
      from,
      to,
    },
  });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown
) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ?? null,
  });
}
