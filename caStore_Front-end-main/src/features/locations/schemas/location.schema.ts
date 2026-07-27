import { z } from 'zod';

export const locationTypeEnum = z.enum(['WAREHOUSE', 'ZONE', 'AISLE', 'SHELF', 'CELL']);

export const locationSchema = z
  .object({
    type: locationTypeEnum,
    parentId: z.string().optional(),
    code: z
      .string()
      .min(1, 'El código es requerido')
      .max(20, 'El código es demasiado largo')
      .regex(/^[A-Z0-9\-]+$/, 'Solo letras mayúsculas, números y guiones'),
    name: z
      .string()
      .min(1, 'El nombre es requerido')
      .max(100, 'El nombre es demasiado largo'),
    capacity: z.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.type !== 'WAREHOUSE' && !data.parentId) return false;
      return true;
    },
    { message: 'La ubicación padre es requerida para este tipo', path: ['parentId'] }
  );

export type LocationFormData = z.infer<typeof locationSchema>;
