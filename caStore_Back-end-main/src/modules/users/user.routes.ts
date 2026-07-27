import { Router } from 'express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const controller = new UserController(new UserService(new UserRepository()));

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de administración de usuarios (RBAC)
router.get('/', rbac('users', 'read'), controller.getAll);
router.get('/:id', rbac('users', 'read'), controller.getById);
router.post('/', rbac('users', 'create'), controller.create);
router.patch('/:id', rbac('users', 'update'), controller.update);
router.patch('/:id/status', rbac('users', 'update'), controller.toggleStatus);
router.post('/:id/resend-password', rbac('users', 'update'), controller.resendPassword);

// Rutas de perfil propio (Cualquier usuario autenticado)
router.patch('/me/profile', controller.updateProfile);
router.patch('/me/password', controller.changePassword);

export default router;
