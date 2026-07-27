import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { AuthRequest } from '../../shared/types';

export class DashboardController {
  constructor(private service: DashboardService = new DashboardService()) {}

  getKPIs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getKPIs();
      res.json({
        success: true,
        message: 'KPIs obtenidos correctamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getCharts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getCharts();
      res.json({
        success: true,
        message: 'Gráficas obtenidas correctamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getWidgets = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getWidgets();
      res.json({
        success: true,
        message: 'Widgets obtenidos correctamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getAll();
      res.json({
        success: true,
        message: 'Dashboard cargado correctamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}
