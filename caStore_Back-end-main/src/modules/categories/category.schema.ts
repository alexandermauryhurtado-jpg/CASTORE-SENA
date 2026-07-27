import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(200).optional(),
  skuPrefix: z.string().min(2).max(10)
    .regex(/^[A-Z]+$/, 'Solo letras mayúsculas'),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
  parentId: z.string().uuid().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const GetCategoriesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  parentId: z.string().optional(),
  includeInactive: z.coerce.boolean().default(false),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
export type GetCategoriesDto = z.infer<typeof GetCategoriesSchema>;
