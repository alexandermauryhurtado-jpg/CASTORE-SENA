import { z } from 'zod';

export const LocationTypeEnum = z.enum(['WAREHOUSE', 'ZONE', 'AISLE', 'SHELF', 'CELL']);

export const CreateLocationSchema = z.object({
  code: z.string().min(1).max(20)
    .regex(/^[A-Z0-9\-]+$/, 'Solo letras mayúsculas, números y guiones'),
  name: z.string().min(1).max(100),
  type: LocationTypeEnum,
  capacity: z.coerce.number().int().positive().optional(),
  parentId: z.string().optional()
}).refine(data => {
  if (data.type !== 'WAREHOUSE' && !data.parentId) {
    return false;
  }
  return true;
}, {
  message: 'La ubicación padre es requerida para este tipo',
  path: ['parentId'],
});

export const UpdateLocationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  capacity: z.coerce.number().int().positive().optional(),
});

export const GetLocationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: LocationTypeEnum.optional(),
  parentId: z.string().optional(),
  includeInactive: z.coerce.boolean().default(false),
});

export type CreateLocationDto = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationDto = z.infer<typeof UpdateLocationSchema>;
export type GetLocationsDto = z.infer<typeof GetLocationsSchema>;
