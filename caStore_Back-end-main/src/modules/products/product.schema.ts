import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(150),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  currentStock: z.coerce.number().int().min(0, 'No puede ser negativo'),
  minStock: z.coerce.number().int().min(0, 'No puede ser negativo'),
  categoryId: z.string().min(1),
  locationId: z.string().min(1).optional(),
  hasExpiry: z.coerce.boolean().default(false),
  expiryDate: z.string().optional(),
}).refine(data => {
  if (data.hasExpiry && !data.expiryDate) {
    return false;
  }
  return true;
}, {
  message: 'La fecha de vencimiento es requerida',
  path: ['expiryDate'],
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive().optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional(),
  hasExpiry: z.coerce.boolean().optional(),
  expiryDate: z.string().optional(),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
});

export const GetProductsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'all']).default('all'),
  lowStock: z.coerce.boolean().default(false),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
export type GetProductsDto = z.infer<typeof GetProductsSchema>;
