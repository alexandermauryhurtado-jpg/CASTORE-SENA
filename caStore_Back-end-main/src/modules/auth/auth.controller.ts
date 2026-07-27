import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginSchema, RecoverPasswordSchema, ResetPasswordSchema } from './auth.schema';
import { successResponse } from '../../shared/utils/response.util';
import { AuthRequest } from '../../shared/types';

/**
 * Controlador para manejar las operaciones de autenticación.
 * Se encarga de recibir las peticiones HTTP, validar los datos de entrada
 * y retornar la respuesta adecuada utilizando el servicio de autenticación.
 */
export class AuthController {
  constructor(private service: AuthService) { }

  /**
   * Maneja el inicio de sesión de los usuarios.
   * Valida las credenciales y genera un token de acceso si son correctas.
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar datos de entrada contra el esquema de login
      const dto = LoginSchema.parse(req.body);
      // Llamar al servicio para autenticar
      const result = await this.service.login(dto);
      return successResponse(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Inicia el proceso de recuperación de contraseña.
   * Envía un correo electrónico con instrucciones si el usuario existe.
   */
  recoverPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar el correo electrónico proporcionado
      const dto = RecoverPasswordSchema.parse(req.body);
      await this.service.recoverPassword(dto);

      // Mensaje genérico por seguridad para no revelar si un correo existe o no
      return successResponse(res, null, 'Si el correo existe recibirás un enlace en minutos');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Restablece la contraseña utilizando un token válido.
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar el nuevo password y el token
      const dto = ResetPasswordSchema.parse(req.body);
      await this.service.resetPassword(dto);
      return successResponse(res, null, 'Contraseña actualizada correctamente');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene la información del usuario autenticado actualmente.
   * Utiliza el ID del usuario extraído del token JWT por el middleware de autenticación.
   */
  getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // req.user es inyectado por el authMiddleware
      const result = await this.service.getMe(req.user!.id);
      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  };
}
