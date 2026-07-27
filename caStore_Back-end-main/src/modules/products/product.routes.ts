import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const repository = new ProductRepository();
const service = new ProductService(repository);
const controller = new ProductController(service);

router.use(authMiddleware);

router.get('/', rbac('products', 'read'), controller.getAll);
router.get('/stats', rbac('products', 'read'), controller.getStats);
router.get('/:id', rbac('products', 'read'), controller.getById);

router.post('/', rbac('products', 'create'), controller.create);

router.patch('/:id', rbac('products', 'update'), controller.update);
router.patch('/:id/status', rbac('products', 'update'), controller.updateStatus);
router.patch('/:id/image', rbac('products', 'update'), controller.uploadImage);

export { router as productRouter };
