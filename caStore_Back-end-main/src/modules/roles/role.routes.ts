import { Router } from 'express';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { rbac } from '../../shared/middleware/rbac.middleware';

const router = Router();
const controller = new RoleController(
  new RoleService(new RoleRepository())
);

// All routes require authentication
router.use(authMiddleware);

router.get('/', rbac('roles', 'read'), controller.getAll);
router.get('/:id', rbac('roles', 'read'), controller.getById);
router.post('/', rbac('roles', 'create'), controller.create);
router.patch('/:id', rbac('roles', 'update'), controller.update);
router.delete('/:id', rbac('roles', 'delete'), controller.delete);
router.post('/:id/clone', rbac('roles', 'create'), controller.clone);

export default router;
