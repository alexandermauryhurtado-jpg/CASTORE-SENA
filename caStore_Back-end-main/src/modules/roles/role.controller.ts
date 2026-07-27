import { Request, Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { CreateRoleSchema, UpdateRoleSchema, GetRolesSchema } from './role.schema';
import { successResponse, paginatedResponse } from '../../shared/utils/response.util';
import { z } from 'zod';

export class RoleController {
  constructor(private service: RoleService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = GetRolesSchema.parse(req.query);
      const result = await this.service.getAll(filters);
      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Roles recuperados correctamente'
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

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateRoleSchema.parse(req.body);
      const result = await this.service.create(dto);
      return successResponse(res, result, 'Rol creado correctamente', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateRoleSchema.parse(req.body);
      const result = await this.service.update(req.params.id as string, dto);
      return successResponse(res, result, 'Rol actualizado correctamente');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id as string);
      return successResponse(res, null, 'Rol eliminado correctamente');
    } catch (error) {
      next(error);
    }
  };

  clone = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const CloneSchema = z.object({ name: z.string().min(1).max(100) });
      const { name } = CloneSchema.parse(req.body);
      const result = await this.service.clone(req.params.id as string, name);
      return successResponse(res, result, 'Rol clonado correctamente', 201);
    } catch (error) {
      next(error);
    }
  };
}
