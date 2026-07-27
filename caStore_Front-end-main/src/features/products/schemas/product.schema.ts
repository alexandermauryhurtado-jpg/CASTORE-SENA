import { z } from 'zod';

/** Alineado con backend CreateProductSchema. Validación condicional de expiryDate cuando hasExpiry es true. */
export const createProductSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido').max(150, 'Máximo 150 caracteres'),
    description: z.string().max(500).optional(),
    price: z.coerce.number().positive('El precio debe ser mayor a 0'),
    currentStock: z.coerce.number().int().min(0, 'No puede ser negativo'),
    minStock: z.coerce.number().int().min(0, 'No puede ser negativo'),
    categoryId: z.string().min(1, 'Selecciona una categoría'),
    locationId: z.string().min(1).optional().or(z.literal('')),
    hasExpiry: z.coerce.boolean().default(false),
    expiryDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasExpiry && !data.expiryDate) return false;
      return true;
    },
    { message: 'La fecha de vencimiento es requerida cuando está activa.', path: ['expiryDate'] }
  );

export type CreateProductFormData = z.infer<typeof createProductSchema>;

/** Alineado con backend UpdateProductSchema. */
export const updateProductSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional(),
  price: z.coerce.number().positive().optional(),
  minStock: z.coerce.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  locationId: z.string().min(1).optional().or(z.literal('')),
  hasExpiry: z.coerce.boolean().optional(),
  expiryDate: z.string().optional(),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

/** Para formulario unificado (crear y editar). */
export type ProductFormData = CreateProductFormData;

/** Alias para uso en formulario. */
export const productSchema = createProductSchema;
