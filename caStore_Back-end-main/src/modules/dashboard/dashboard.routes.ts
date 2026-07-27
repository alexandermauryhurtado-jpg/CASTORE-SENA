import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const controller = new DashboardController();

// Todas las rutas requieren autenticación y permiso de dashboard:read
router.use(authMiddleware);
router.use(rbac('dashboard', 'read'));

router.get('/', controller.getAll);
router.get('/kpis', controller.getKPIs);
router.get('/charts', controller.getCharts);
router.get('/widgets', controller.getWidgets);

export default router;
