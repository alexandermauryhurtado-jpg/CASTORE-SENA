import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';
import { AuthRequest } from '../types';

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = header.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const payload = verifyToken(token);

    // LOG TEMPORAL
    console.log('=== AUTH MIDDLEWARE ===')
    console.log('User ID:', payload.id)
    console.log('Permissions:', JSON.stringify(payload.permissions, null, 2))
    console.log('======================')

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}