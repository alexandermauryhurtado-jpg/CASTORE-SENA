import { z } from 'zod';

const PermissionItemSchema = z.object({
  read: z.boolean(),
  create: z.boolean(),
  update: z.boolean(),
  delete: z.boolean(),
});

const RoleBaseSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(200).optional(),
  permissions: z.record(z.string(), PermissionItemSchema),
});

export const CreateRoleSchema = RoleBaseSchema.refine((data) => {
  // At least one module must have read: true
  const perms = Object.values(data.permissions) as Array<{ read: boolean }>;
  return perms.some(p => p.read === true);
}, {
  message: 'El rol debe tener al menos un permiso de consulta',
  path: ['permissions'],
});

export const UpdateRoleSchema = RoleBaseSchema.partial();

export const GetRolesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.enum(['all', 'system', 'custom']).default('all'),
  includeInactive: z.coerce.boolean().default(false),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
export type GetRolesDto = z.infer<typeof GetRolesSchema>;
