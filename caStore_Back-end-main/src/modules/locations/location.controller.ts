import { Request, Response, NextFunction } from 'express';
import { LocationService } from './location.service';
import { CreateLocationSchema, UpdateLocationSchema, GetLocationsSchema } from './location.schema';
import { successResponse, paginatedResponse } from '../../shared/utils/response.util';

export class LocationController {
  constructor(private service: LocationService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = GetLocationsSchema.parse(req.query);
      const result = await this.service.getAll(filters);
      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Ubicaciones recuperadas correctamente'
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getById(req.params.id as string);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  getTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getTree();
      return successResponse(res, result, 'Árbol de ubicaciones recuperado correctamente');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateLocationSchema.parse(req.body);
      const result = await this.service.create(dto);
      return successResponse(res, result, 'Localización creada correctamente', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateLocationSchema.parse(req.body);
      const result = await this.service.update(req.params.id as string, dto);
      return successResponse(res, result, 'Localización actualizada correctamente');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id as string);
      return successResponse(res, null, 'Localización eliminada correctamente');
    } catch (error) {
      next(error);
    }
  };
}
