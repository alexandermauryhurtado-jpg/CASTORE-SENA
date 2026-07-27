import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { SupplierService } from './supplier.service';
import { GetSuppliersSchema, CreateSupplierSchema, UpdateSupplierSchema } from './supplier.schema';
import { successResponse, paginatedResponse } from '../../shared/utils/response.util';

export class SupplierController {
  constructor(private service: SupplierService) {}

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = GetSuppliersSchema.parse(req.query);
      const result = await this.service.getAll(filters);
      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const supplier = await this.service.getById(id);
      return successResponse(res, supplier);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = CreateSupplierSchema.parse(req.body);
      const supplier = await this.service.create(dto);
      return successResponse(res, supplier, 'Proveedor creado correctamente', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const dto = UpdateSupplierSchema.parse(req.body);
      const supplier = await this.service.update(id, dto);
      return successResponse(res, supplier, 'Proveedor actualizado correctamente');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      await this.service.delete(id);
      return successResponse(res, null, 'Proveedor eliminado correctamente');
    } catch (error) {
      next(error);
    }
  };

  getPurchaseHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);

      const PurchaseHistoryQuerySchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        search: z.string().optional(),
      });

      const filters = PurchaseHistoryQuerySchema.parse(req.query);
      const result = await this.service.getPurchaseHistory(id, filters);

      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit
      );
    } catch (error) {
      next(error);
    }
  };
}
