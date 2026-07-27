import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const RecoverPasswordSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe tener al menos un carácter especial'),
  confirm: z.string().min(1, 'La confirmación es requerida'),
}).refine((data) => data.password === data.confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm'],
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RecoverPasswordDto = z.infer<typeof RecoverPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
