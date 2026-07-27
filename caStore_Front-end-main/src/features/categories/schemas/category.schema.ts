import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  description: z.string()
    .max(200, 'La descripción no puede exceder los 200 caracteres')
    .optional(),
  skuPrefix: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(10, 'Máximo 10 caracteres')
    .regex(/^[A-Z]+$/, 'Solo letras mayúsculas'),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

/** Sugerencia de prefijo desde el nombre (solo letras mayúsculas, 2–10 caracteres). */
export function getSuggestedSkuPrefix(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 10);
}

/** Preview legible para mostrar en UI (ej. "MOTO-"). */
export function skuPreviewDisplay(skuPrefix: string): string {
  const p = (skuPrefix || '').trim().toUpperCase().replace(/[^A-Z]/g, '');
  return p ? `${p}-` : '----';
}
