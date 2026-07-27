import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../exceptions/UnauthorizedError';

export interface AuthPayload {
  id: string;
  email: string;
  roleId: string;
  permissions: Record<string, Record<string, boolean>>;
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): AuthPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
  } catch (error) {
    throw new UnauthorizedError('Token inválido o expirado');
  }
}
