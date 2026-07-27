import { Router } from 'express';
import { MovementController } from './movement.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const controller = new MovementController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Usuarios con permisos de inventario (Warehouse, Admin, etc)
router.get('/', rbac('movements', 'read'), controller.getAll);
router.get('/kardex', rbac('movements', 'read'), controller.getKardex);
router.get('/summary/daily', rbac('movements', 'read'), controller.getDailySummary);
router.get('/summary/today', rbac('movements', 'read'), controller.getTodaySummary);
router.get('/:id', rbac('movements', 'read'), controller.getById);

router.post('/', rbac('movements', 'create'), controller.register);

export default router;
