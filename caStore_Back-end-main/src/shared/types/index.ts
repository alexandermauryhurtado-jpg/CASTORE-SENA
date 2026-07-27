import { Request } from 'express';
import { z } from 'zod';

export interface AuthPayload {
  id: string;
  email: string;
  roleId: string;
  permissions: Record<string, Record<string, boolean>>;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface Permissions {
  [module: string]: {
    [action: string]: boolean;
  };
}

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type PaginationDto = z.infer<typeof PaginationSchema>;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
  from: number;
  to: number;
}

// Domain Entities
export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  isActive: boolean;
  firstLogin: boolean;
  roleId: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permissions;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  currentStock: number;
  minStock: number;
  hasExpiry: boolean;
  expiryDate?: Date;
  status: 'active' | 'inactive';
  categoryId: string;
  locationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  skuPrefix: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'WAREHOUSE' | 'ZONE' | 'AISLE' | 'SHELF' | 'CELL';
  parentId?: string;
  capacity?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Movement {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  productId: string;
  quantity: number;
  originLocationId?: string;
  destinationLocationId?: string;
  userId: string;
  reason?: string;
  reference?: string;
  createdAt: Date;
}

export interface StockAlert {
  id: string;
  productId: string;
  type: 'LOW_STOCK' | 'EXPIRY_NEAR' | 'OUT_OF_STOCK';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: string; // JSON
  newValues?: string; // JSON
  ip: string;
  createdAt: Date;
}
