import { z } from 'zod';

export const alertConfigSchema = z.object({
  productId: z.string().min(1, 'Debe seleccionar un producto'),
  alertType: z.enum(['low_stock', 'expiration'], {
    message: 'Debe seleccionar un tipo de alerta'
  }),
  minStock: z.number().int().optional(),
  expirationDays: z.array(z.number()).optional(),
  emailNotification: z.boolean().default(false)
}).superRefine((data, ctx) => {
  if (data.alertType === 'low_stock') {
    if (data.minStock === undefined || data.minStock <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El stock mínimo debe ser mayor a 0',
        path: ['minStock']
      });
    }
  }

  if (data.alertType === 'expiration') {
    if (!data.expirationDays || data.expirationDays.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe seleccionar al menos un período de aviso',
        path: ['expirationDays']
      });
    }
  }
});

export type AlertConfigFormData = z.infer<typeof alertConfigSchema>;
