import { z } from 'zod';
import type { MovementTypeApi } from '../types/movements.types';

const movementTypeEnum = z.enum([
  'PURCHASE_ENTRY',
  'SALE_EXIT',
  'TRANSFER',
  'POSITIVE_ADJUSTMENT',
  'NEGATIVE_ADJUSTMENT',
  'RETURN',
]);

const baseSchema = z.object({
  productId: z.string().min(1, 'Debe seleccionar un producto'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a cero'),
  createdAt: z.string().refine(
    (val) => {
      const date = new Date(val);
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return date <= now && date >= thirtyDaysAgo;
    },
    'La fecha debe ser actual o de los últimos 30 días'
  ),
  notes: z.string().max(500).optional(),
  docReference: z.string().max(100).optional(),
  lotNumber: z.string().max(50).optional(),
  unitCost: z.coerce.number().positive().optional(),
  supplierId: z.string().optional(),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional(),
});

export const createMovementSchema = baseSchema
  .extend({
    type: movementTypeEnum,
  })
  .superRefine((data, ctx) => {
    if (data.type === 'PURCHASE_ENTRY' && !data.toLocationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La ubicación de destino es requerida para entradas por compra',
        path: ['toLocationId'],
      });
    }
    if (data.type === 'SALE_EXIT' && !data.fromLocationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La ubicación de origen es requerida para salidas por venta',
        path: ['fromLocationId'],
      });
    }
    if (data.type === 'TRANSFER') {
      if (!data.fromLocationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La ubicación de origen es requerida para transferencias',
          path: ['fromLocationId'],
        });
      }
      if (!data.toLocationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La ubicación de destino es requerida para transferencias',
          path: ['toLocationId'],
        });
      }
      if (data.fromLocationId && data.toLocationId && data.fromLocationId === data.toLocationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Las ubicaciones de origen y destino deben ser diferentes',
          path: ['toLocationId'],
        });
      }
    }
  });

export type CreateMovementFormData = z.infer<typeof createMovementSchema>;

/** Esquema discriminado legacy (formulario con tipos en snake_case) — mantener si otros componentes lo usan. */
export const movementSchema = createMovementSchema;
export type MovementFormData = CreateMovementFormData;
