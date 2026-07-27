import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ForbiddenError } from '../exceptions/ForbiddenError';

export function rbac(module: string, action: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions;
    
    if (!permissions?.[module]?.[action]) {
      throw new ForbiddenError(`No tienes permiso para ${action} en ${module}`);
    }
    
    next();
  };
}
