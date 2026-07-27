import { Router } from 'express';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const repository = new CategoryRepository();
const service = new CategoryService(repository);
const controller = new CategoryController(service);

router.use(authMiddleware);

// GET routes
router.get('/', rbac('categories', 'read'), controller.getAll);
router.get('/tree', rbac('categories', 'read'), controller.getTree);
router.get('/:id', rbac('categories', 'read'), controller.getById);

// Write routes
router.post('/', rbac('categories', 'create'), controller.create);
router.patch('/:id', rbac('categories', 'update'), controller.update);
router.delete('/:id', rbac('categories', 'delete'), controller.delete);

export { router as categoryRouter };
