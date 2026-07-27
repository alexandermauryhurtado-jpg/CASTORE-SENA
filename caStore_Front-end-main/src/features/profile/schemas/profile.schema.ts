import { z } from 'zod';

/** Solo nombre; el correo es solo informativo y no se edita en el perfil. */
export const profilePersonalSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .max(150, 'El nombre es demasiado largo'),
});

export type ProfilePersonalFormData = z.infer<typeof profilePersonalSchema>;
