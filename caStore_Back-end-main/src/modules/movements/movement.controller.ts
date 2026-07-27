import { Response, NextFunction } from 'express';
import { MovementService } from './movement.service';
import { AuthRequest } from '../../shared/types';
import { CreateMovementSchema, GetMovementsSchema, KardexSchema } from './movement.schema';

export class MovementController {
  constructor(private service: MovementService = new MovementService()) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters = GetMovementsSchema.parse(req.query);
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

  register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = CreateMovementSchema.parse(req.body);
      const userId = req.user!.id; // El middleware de auth asegura que existe
      const result = await this.service.register(dto, userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getKardex = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters = KardexSchema.parse({
        ...req.query,
        productId: req.query.productId,
      });
      const result = await this.service.getKardex(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getDailySummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const result = await this.service.getDailySummary(days);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getTodaySummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getTodaySummary();
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
