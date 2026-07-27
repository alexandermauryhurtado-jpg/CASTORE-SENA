import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { query } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';

export function auditLog(action: string, entity: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // We hook into the finish event to only log successful operations
    res.on('finish', () => {
      if (res.statusCode < 400 && req.user) {
        const auditData = {
          id: uuidv4(),
          userId: req.user.id,
          action,
          entity,
          entityId: req.params.id || null,
          oldValues: null, // This would ideally be populated by the service layer or captured before
          newValues: req.method !== 'GET' ? JSON.stringify(req.body) : null,
          ip: req.ip || '',
        };

        // Fire and forget or handle error quietly
        query(
          `INSERT INTO audit_logs (id, user_id, action, entity, entity_id, old_values, new_values, ip)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [auditData.id, auditData.userId, auditData.action, auditData.entity, auditData.entityId, auditData.oldValues, auditData.newValues, auditData.ip]
        ).catch(err => console.error('Error saving audit log:', err));
      }
    });

    next();
  };
}
