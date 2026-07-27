import { z } from 'zod';

/**
 * Dígito de verificación NIT (Colombia).
 */
export const calculateNITVerificationDigit = (nit: string): number => {
  const nitStr = nit.trim().replace(/\D/g, '');
  if (!nitStr || nitStr.length === 0) return 0;

  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;

  for (let i = 0; i < nitStr.length; i++) {
    const digit = parseInt(nitStr.charAt(nitStr.length - 1 - i), 10);
    sum += digit * weights[i];
  }

  const remainder = sum % 11;
  if (remainder < 2) return remainder;
  return 11 - remainder;
};

const supplierTypeEnum = z.enum(['NATIONAL', 'INTERNATIONAL', 'MANUFACTURER', 'DISTRIBUTOR'], {
  message: 'Debe seleccionar un tipo de proveedor',
});
const contributorTypeEnum = z.enum(['LARGE', 'COMMON', 'SIMPLIFIED', 'NON_CONTRIBUTOR'], {
  message: 'Debe seleccionar un tipo de contribuyente',
});

/** Paso 1: información legal y de contacto (alineado con backend). */
export const supplierStep1Schema = z.object({
  legalName: z.string().min(1, 'La razón social es requerida').max(200),
  tradeName: z.string().min(1, 'El nombre comercial es requerido').max(200),
  taxId: z.string().min(1, 'El NIT/RUC es requerido').max(20),
  type: supplierTypeEnum,
  contributorType: contributorTypeEnum,
  country: z.string().min(1, 'El país es requerido').max(100),
  state: z.string().max(100).optional().nullable(),
  city: z.string().min(1, 'La ciudad es requerida').max(100),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Correo electrónico inválido').max(255).optional().nullable(),
  contactName: z.string().max(150).optional().nullable(),
});

/** Paso 2: condiciones comerciales. */
export const supplierStep2Schema = z.object({
  paymentTerms: z.string().max(50).optional().nullable(),
  currency: z.string().max(10).default('COP'),
  website: z.union([z.string().url('URL inválida'), z.literal('')]).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const supplierSchema = supplierStep1Schema.merge(supplierStep2Schema);

export type SupplierFormData = z.infer<typeof supplierSchema>;
export type SupplierStep1Data = z.infer<typeof supplierStep1Schema>;
export type SupplierStep2Data = z.infer<typeof supplierStep2Schema>;
