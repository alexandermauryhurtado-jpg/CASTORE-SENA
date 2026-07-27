import { Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { CreateUserSchema, UpdateUserSchema, UpdateProfileSchema, ChangePasswordSchema, GetUsersSchema, UpdateUserStatusSchema } from './user.schema';
import { successResponse, paginatedResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../shared/types';

export class UserController {
  constructor(private service: UserService) { }
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = CreateUserSchema.parse(req.body);
      const user = await this.service.create(dto);
      return successResponse(res, user, 'Usuario creado. Se enviaron las credenciales al correo.', 201);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const filters = GetUsersSchema.parse(req.query);
      const result = await this.service.getAll(filters);
      return paginatedResponse(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        'Usuarios recuperados correctamente'
      );
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.getById(req.params.id as string);
      return successResponse(res, user, 'Usuario recuperado correctamente');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateUserSchema.parse(req.body);
      const user = await this.service.update(req.params.id as string, dto);
      return successResponse(res, user, 'Usuario actualizado correctamente');
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { isActive } = UpdateUserStatusSchema.parse(req.body);
      const user = await this.service.toggleStatus(req.params.id as string, isActive, req.user!.id);
      const message = user.isActive
        ? 'Usuario activado correctamente'
        : 'Usuario desactivado correctamente';
      return successResponse(res, user, message);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = ChangePasswordSchema.parse(req.body);
      await this.service.changePassword(req.user!.id, dto);
      return successResponse(res, null, 'Contraseña actualizada correctamente');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dto = UpdateProfileSchema.parse(req.body);
      const user = await this.service.updateProfile(req.user!.id, dto);
      return successResponse(res, user, 'Perfil actualizado correctamente');
    } catch (error) {
      next(error);
    }
  };

  resendPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await this.service.resendPassword(req.params.id as string);
      return successResponse(res, null, 'Nueva contraseña enviada al correo del usuario');
    } catch (error) {
      next(error);
    }
  };
}
