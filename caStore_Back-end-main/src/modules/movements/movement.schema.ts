import { z } from 'zod';

export const MovementTypeEnum = z.enum([
  'PURCHASE_ENTRY',
  'SALE_EXIT',
  'TRANSFER',
  'POSITIVE_ADJUSTMENT',
  'NEGATIVE_ADJUSTMENT',
  'RETURN',
]);

export type MovementType = z.infer<typeof MovementTypeEnum>;

export const CreateMovementSchema = z.object({
  type: MovementTypeEnum,
  productId: z.string().min(1, 'El producto es requerido'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
  lotNumber: z.string().max(50).optional(),
  docReference: z.string().max(100).optional(),
  notes: z.string().optional(),
  unitCost: z.coerce.number().positive().optional(),
  supplierId: z.string().optional(),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional(),
  createdAt: z.string().optional().refine((val) => {
    if (!val) return true;
    const date = new Date(val);
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return date <= now && date >= thirtyDaysAgo;
  }, {
    message: 'La fecha no puede ser futura ni mayor a 30 días atrás',
  }),
}).superRefine((data, ctx) => {
  // PURCHASE_ENTRY: supplierId recomendado (no requerido estrictamente pero validamos toLocationId)
  if (data.type === 'PURCHASE_ENTRY' && !data.toLocationId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La ubicación de destino es requerida para entradas por compra',
      path: ['toLocationId'],
    });
  }

  // SALE_EXIT: fromLocationId requerido
  if (data.type === 'SALE_EXIT' && !data.fromLocationId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La ubicación de origen es requerida para salidas por venta',
      path: ['fromLocationId'],
    });
  }

  // TRANSFER: fromLocationId y toLocationId requeridos y distintos
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

export const GetMovementsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  productId: z.string().optional(),
  type: z.enum([...MovementTypeEnum.options, 'all'] as any).default('all'),
  supplierId: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const KardexSchema = z.object({
  productId: z.string().min(1, 'El producto es requerido'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type CreateMovementDto = z.infer<typeof CreateMovementSchema>;
export type GetMovementsDto = z.infer<typeof GetMovementsSchema>;
export type KardexDto = z.infer<typeof KardexSchema>;
