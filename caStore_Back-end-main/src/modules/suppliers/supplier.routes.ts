import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierRepository } from './supplier.repository';

const router = Router();
const controller = new SupplierController(
  new SupplierService(new SupplierRepository())
);

router.use(authMiddleware);

router.get('/', rbac('suppliers', 'read'), controller.getAll);
router.get('/:id', rbac('suppliers', 'read'), controller.getById);
router.get('/:id/purchases', rbac('suppliers', 'read'), controller.getPurchaseHistory);
router.post('/', rbac('suppliers', 'create'), controller.create);
router.patch('/:id', rbac('suppliers', 'update'), controller.update);
router.delete('/:id', rbac('suppliers', 'delete'), controller.delete);

export default router;
export { router as supplierRouter };
