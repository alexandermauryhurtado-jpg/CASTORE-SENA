import { Request, Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { CreateCategorySchema, UpdateCategorySchema, GetCategoriesSchema } from './category.schema';
import { successResponse, paginatedResponse } from '../../shared/utils/response.util';

export class CategoryController {
  constructor(private service: CategoryService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = GetCategoriesSchema.parse(req.query);
      const result = await this.service.getAll(filters);
      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Categorías recuperadas correctamente'
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
      return successResponse(res, result, 'Árbol de categorías recuperado correctamente');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateCategorySchema.parse(req.body);
      const result = await this.service.create(dto);
      return successResponse(res, result, 'Categoría creada correctamente', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateCategorySchema.parse(req.body);
      const result = await this.service.update(req.params.id as string, dto);
      return successResponse(res, result, 'Categoría actualizada correctamente');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id as string);
      return successResponse(res, null, 'Categoría eliminada correctamente');
    } catch (error) {
      next(error);
    }
  };
}
