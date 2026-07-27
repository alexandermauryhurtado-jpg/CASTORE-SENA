import { Router } from 'express';
import { AlertController } from './alert.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const controller = new AlertController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de alertas
router.get('/', rbac('alerts', 'read'), controller.getAll);
router.get('/summary', rbac('alerts', 'read'), controller.getSummary);
router.get('/:id', rbac('alerts', 'read'), controller.getById);

router.patch('/:id/resolve', rbac('alerts', 'update'), controller.resolve);
router.patch('/:id/dismiss', rbac('alerts', 'update'), controller.dismiss);

export default router;
