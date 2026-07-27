import { z } from 'zod';

export const AlertTypeEnum = z.enum([
  'LOW_STOCK',
  'EXPIRY_30D',
  'EXPIRY_15D',
  'EXPIRY_7D',
]);

export type AlertType = z.infer<typeof AlertTypeEnum>;

export const AlertStatusEnum = z.enum([
  'ACTIVE',
  'RESOLVED',
  'DISMISSED',
]);

export type AlertStatus = z.infer<typeof AlertStatusEnum>;

export const GetAlertsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  productId: z.string().optional(),
  type: z.enum([...AlertTypeEnum.options, 'all'] as any).default('all'),
  status: z.enum([...AlertStatusEnum.options, 'all'] as any).default('all'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const ResolveAlertSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const CreateAlertSchema = z.object({
  type: AlertTypeEnum,
  productId: z.string().min(1, 'El producto es requerido'),
  threshold: z.coerce.number().int().min(0),
  currentValue: z.coerce.number().int().min(0),
  notes: z.string().optional(),
});

export const DismissAlertSchema = z.object({
  notes: z.string().max(500).optional(),
});

export type GetAlertsDto = z.infer<typeof GetAlertsSchema>;
export type ResolveAlertDto = z.infer<typeof ResolveAlertSchema>;
export type CreateAlertDto = z.infer<typeof CreateAlertSchema>;
export type DismissAlertDto = z.infer<typeof DismissAlertSchema>;
