import { Router } from 'express';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { LocationRepository } from './location.repository';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const repository = new LocationRepository();
const service = new LocationService(repository);
const controller = new LocationController(service);

router.use(authMiddleware);

// GET routes
router.get('/', rbac('locations', 'read'), controller.getAll);
router.get('/tree', rbac('locations', 'read'), controller.getTree);
router.get('/:id', rbac('locations', 'read'), controller.getById);

// Write routes
router.post('/', rbac('locations', 'create'), controller.create);
router.patch('/:id', rbac('locations', 'update'), controller.update);
router.delete('/:id', rbac('locations', 'delete'), controller.delete);

export { router as locationRouter };
