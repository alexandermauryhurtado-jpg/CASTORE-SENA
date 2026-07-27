import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import { ZodError } from 'zod';
import { env } from '../../config/env';

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Datos de entrada inválidos',
      code: 'VALIDATION_ERROR',
      errors: err.flatten().fieldErrors,
    });
  }

  console.error('❌ Internal Server Error:', err);

  const response: any = {
    success: false,
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  };

  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.detail = err.message;
  }

  return res.status(500).json(response);
}
