import { Response, NextFunction } from 'express';
import { ProductService } from './product.service';
import { 
  CreateProductSchema, 
  UpdateProductSchema, 
  UpdateStatusSchema, 
  GetProductsSchema 
} from './product.schema';
import { successResponse, paginatedResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../shared/types';

export class ProductController {
  constructor(private service: ProductService) {}

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters = GetProductsSchema.parse(req.query);
      const result = await this.service.getAll(filters);
      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Productos recuperados correctamente'
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const product = await this.service.getById(req.params.id as string);
      return successResponse(res, product, 'Producto recuperado correctamente');
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = CreateProductSchema.parse(req.body);
      const product = await this.service.create(dto, req.user!.id);
      return successResponse(res, product, 'Producto creado correctamente', 201);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateProductSchema.parse(req.body);
      const product = await this.service.update(req.params.id as string, dto);
      return successResponse(res, product, 'Producto actualizado correctamente');
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateStatusSchema.parse(req.body);
      const product = await this.service.updateStatus(req.params.id as string, dto);
      
      let message = 'Estado del producto actualizado';
      if (dto.status === 'ACTIVE') message = 'Producto activado';
      if (dto.status === 'INACTIVE') message = 'Producto desactivado';
      if (dto.status === 'DISCONTINUED') message = 'Producto marcado como descontinuado';
      
      return successResponse(res, product, message);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.service.getStats();
      return successResponse(res, stats, 'Estadísticas recuperadas correctamente');
    } catch (error) {
      next(error);
    }
  };

  uploadImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { imageUrl } = req.body;
      const product = await this.service.uploadImage(req.params.id as string, imageUrl);
      return successResponse(res, product, 'Imagen actualizada correctamente');
    } catch (error) {
      next(error);
    }
  };
}
