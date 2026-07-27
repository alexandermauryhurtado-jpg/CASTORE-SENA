import { z } from 'zod';

// Permission Matrix logic
export const permissionSetSchema = z.object({
  consult: z.boolean(),
  create: z.boolean(),
  update: z.boolean(),
  delete: z.boolean(),
}).refine(data => {
  // Rule: If consult is false, the others must be false
  if (!data.consult && (data.create || data.update || data.delete)) {
    return false;
  }
  return true;
}, {
  message: "No se pueden asignar permisos de acción sin permiso de consulta",
  path: ["consult"]
});

export const roleSchema = z.object({
  name: z.string()
    .min(3, 'El nombre del rol debe tener al menos 3 caracteres')
    .max(50, 'El nombre es demasiado largo'),
  description: z.string().max(200, 'La descripción es demasiado larga').optional(),
  permissions: z.record(z.string(), permissionSetSchema)
});

export const userSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido').max(150, 'Nombre demasiado largo'),
  email: z.string().min(1, 'El correo es requerido').email('Ingresa un correo electrónico válido'),
  roleId: z.string().min(1, 'Debes seleccionar un rol'),
  status: z.enum(['active', 'inactive']).optional(),
});

export type RoleFormData = z.infer<typeof roleSchema>;
export type UserFormData = z.infer<typeof userSchema>;

// Utility to get initials from a full name
export const getInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(p => p.length > 0);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
};
