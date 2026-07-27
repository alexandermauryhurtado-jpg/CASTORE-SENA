import { z } from 'zod';

export const CreateSupplierSchema = z.object({
  legalName: z.string().min(1, 'El nombre legal es requerido').max(200),
  tradeName: z.string().min(1, 'El nombre comercial es requerido').max(200),
  taxId: z.string().min(1, 'El NIT/RUC es requerido').max(20),
  type: z.enum(['NATIONAL', 'INTERNATIONAL', 'MANUFACTURER', 'DISTRIBUTOR']),
  contributorType: z.enum(['LARGE', 'COMMON', 'SIMPLIFIED', 'NON_CONTRIBUTOR']),
  country: z.string().min(1).max(100).default('Colombia'),
  state: z.string().max(100).optional().nullable(),
  city: z.string().min(1).max(100),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Email inválido').max(255).optional().nullable(),
  contactName: z.string().max(150).optional().nullable(),
  paymentTerms: z.string().max(50).optional().nullable(),
  currency: z.string().max(10).default('COP'),
  website: z.union([z.string().url('URL inválida'), z.literal('')]).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export const GetSuppliersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.enum(['NATIONAL', 'INTERNATIONAL', 'MANUFACTURER', 'DISTRIBUTOR']).optional(),
  contributorType: z.enum(['LARGE', 'COMMON', 'SIMPLIFIED', 'NON_CONTRIBUTOR']).optional(),
  city: z.string().optional(),
  includeInactive: z.coerce.boolean().default(false),
});

export type CreateSupplierDto = z.infer<typeof CreateSupplierSchema>;
export type UpdateSupplierDto = z.infer<typeof UpdateSupplierSchema>;
export type GetSuppliersDto = z.infer<typeof GetSuppliersSchema>;
