import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import { errorMiddleware } from './shared/middleware/error.middleware';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
  });
});

// API Routes
import authRouter from './modules/auth/auth.routes';
import roleRouter from './modules/roles/role.routes';
import userRouter from './modules/users/user.routes';
import { categoryRouter } from './modules/categories/category.routes';
import { locationRouter } from './modules/locations/location.routes';
import { supplierRouter } from './modules/suppliers/supplier.routes';
import { productRouter } from './modules/products/product.routes';
import movementRouter from './modules/movements/movement.routes';
import alertRouter from './modules/alerts/alert.routes';
import dashboardRouter from './modules/dashboard/dashboard.routes';


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/locations', locationRouter);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/movements', movementRouter);
app.use('/api/v1/alerts', alertRouter);
app.use('/api/v1/dashboard', dashboardRouter);


// Error Handling
app.use(errorMiddleware);

export { app };
