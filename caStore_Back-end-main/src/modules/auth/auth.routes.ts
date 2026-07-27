import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();
const controller = new AuthController(
  new AuthService(new AuthRepository())
);

// Public routes
router.post('/login', controller.login);
router.post('/recover-password', controller.recoverPassword);
router.post('/reset-password', controller.resetPassword);

// Protected routes
router.get('/me', authMiddleware, controller.getMe);

export default router;
