import { z } from 'zod';

export const CreateUserSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido').max(150),
  email: z.string().min(1, 'El correo es requerido').email('Correo electrónico inválido'),
  roleId: z.string().min(1, 'ID de rol inválido'),
});

export const UpdateUserSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  email: z.string().email().optional(),
  roleId: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(1).max(150).optional(),
  email: z.string().email().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe tener al menos un carácter especial'),
  confirm: z.string(),
}).refine((data) => data.newPassword === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

export const GetUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  roleId: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
});

export const UpdateUserStatusSchema = z.object({
  isActive: z.boolean({
    message: 'isActive debe ser un booleano'
  }),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type GetUsersDto = z.infer<typeof GetUsersSchema>;
