import { Response, NextFunction } from 'express';
import { AlertService } from './alert.service';
import { AuthRequest } from '../../shared/types';
import { GetAlertsSchema, ResolveAlertSchema, DismissAlertSchema } from './alert.schema';

export class AlertController {
  constructor(private service: AlertService = new AlertService()) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters = GetAlertsSchema.parse(req.query);
      const result = await this.service.getAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getById(String(req.params.id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getSummary();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resolve = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = ResolveAlertSchema.parse(req.body);
      const userId = req.user!.id;
      const result = await this.service.resolve(String(req.params.id), userId, dto);
      res.json({
        success: true,
        message: 'Alerta resuelta correctamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  dismiss = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = DismissAlertSchema.parse(req.body);
      const userId = req.user!.id;
      const result = await this.service.dismiss(String(req.params.id), userId, dto);
      res.json({
        success: true,
        message: 'Alerta descartada correctamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
