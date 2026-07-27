'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Upload,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  supplierSchema,
  supplierStep1Schema,
  supplierStep2Schema,
  calculateNITVerificationDigit,
  type SupplierFormData,
} from '../../schemas/supplier.schema';
import type { SupplierWithStatsApi } from '../../types/suppliers.types';
import styles from './SupplierWizard.module.css';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Select } from '@/src/components/ui/Select';
import { useToast } from '@/src/components/ui/Toast';
import { useCreateSupplier, useUpdateSupplier } from '../../hooks/useSuppliers';
import { suppliersService } from '@/src/services/suppliers.service';

interface SupplierWizardProps {
  initialData?: SupplierWithStatsApi | null;
  isEdit?: boolean;
}

const STEPS = [
  { id: 1, name: 'Información legal' },
  { id: 2, name: 'Comercial' },
  { id: 3, name: 'Confirmación' },
];

const TYPE_OPTIONS = [
  { value: 'NATIONAL', label: 'Nacional' },
  { value: 'INTERNATIONAL', label: 'Internacional' },
  { value: 'MANUFACTURER', label: 'Fabricante' },
  { value: 'DISTRIBUTOR', label: 'Distribuidor' },
];

const CONTRIBUTOR_OPTIONS = [
  { value: 'LARGE', label: 'Gran Contribuyente' },
  { value: 'COMMON', label: 'Persona Jurídica' },
  { value: 'SIMPLIFIED', label: 'Régimen Simplificado' },
  { value: 'NON_CONTRIBUTOR', label: 'Persona Natural' },
];

const PAYMENT_OPTIONS = [
  { value: 'Contado', label: 'Contado' },
  { value: '30 días', label: '30 días' },
  { value: '60 días', label: '60 días' },
  { value: '90 días', label: '90 días' },
];

const CURRENCY_OPTIONS = [
  { value: 'COP', label: 'COP (Peso Colombiano)' },
  { value: 'USD', label: 'USD (Dólar)' },
  { value: 'EUR', label: 'EUR (Euro)' },
];

const DEBOUNCE_MS = 500;

function supplierToFormData(s: SupplierWithStatsApi): Partial<SupplierFormData> {
  return {
    legalName: s.legalName,
    tradeName: s.tradeName,
    taxId: s.taxId,
    type: s.type,
    contributorType: s.contributorType,
    country: s.country,
    state: s.state ?? undefined,
    city: s.city,
    address: s.address ?? undefined,
    phone: s.phone ?? undefined,
    email: s.email ?? undefined,
    contactName: s.contactName ?? undefined,
    paymentTerms: s.paymentTerms ?? undefined,
    currency: s.currency || 'COP',
    website: s.website ?? undefined,
    notes: s.notes ?? undefined,
  };
}

export function SupplierWizard({ initialData, isEdit = false }: SupplierWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [nitDV, setNitDV] = useState<number | null>(null);
  const [nitError, setNitError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const defaultValues: Partial<SupplierFormData> = initialData
    ? supplierToFormData(initialData)
    : {
        country: 'Colombia',
        currency: 'COP',
        paymentTerms: '30 días',
        state: null,
        address: null,
        website: null,
        notes: null,
      };

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(
      currentStep === 1 ? supplierStep1Schema : currentStep === 2 ? supplierStep2Schema : supplierSchema
    ) as unknown as Resolver<SupplierFormData>,
    defaultValues,
  });

  const taxIdValue = watch('taxId');

  useEffect(() => {
    if (taxIdValue) {
      setNitDV(calculateNITVerificationDigit(taxIdValue));
    } else {
      setNitDV(null);
    }
  }, [taxIdValue]);

  const checkNitUnique = useCallback(
    async (taxId: string, excludeId?: string) => {
      const exists = await suppliersService.checkTaxIdExists(taxId, excludeId);
      if (exists) {
        setNitError('Ya existe un proveedor con este NIT/RUC');
        return false;
      }
      setNitError(null);
      return true;
    },
    []
  );

  useEffect(() => {
    if (!taxIdValue || taxIdValue.trim().length < 5) {
      setNitError(null);
      return;
    }
    const t = setTimeout(() => {
      checkNitUnique(taxIdValue.trim(), isEdit ? initialData?.id : undefined).catch(() => {
        setNitError('Error al verificar NIT');
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [taxIdValue, isEdit, initialData?.id, checkNitUnique]);

  const handleNext = async () => {
    const fieldsToValidate =
      currentStep === 1
        ? (Object.keys(supplierStep1Schema.shape) as (keyof SupplierFormData)[])
        : (Object.keys(supplierStep2Schema.shape) as (keyof SupplierFormData)[]);
    const isValid = await trigger(fieldsToValidate);
    const nitOk = currentStep === 1 ? !nitError : true;
    if (isValid && nitOk) setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => setCurrentStep((prev) => prev - 1);

  const onSubmit = async (data: SupplierFormData) => {
    const dto = {
      legalName: data.legalName,
      tradeName: data.tradeName,
      taxId: data.taxId.trim().replace(/\s/g, ''),
      type: data.type,
      contributorType: data.contributorType,
      country: data.country,
      state: data.state || null,
      city: data.city,
      address: data.address || null,
      phone: data.phone || null,
      email: data.email || null,
      contactName: data.contactName || null,
      paymentTerms: data.paymentTerms || null,
      currency: data.currency || 'COP',
      website: data.website || null,
      notes: data.notes || null,
    };

    if (isEdit && initialData?.id) {
      updateMutation.mutate(
        { id: initialData.id, dto },
        {
          onSuccess: (res) => {
            if (res) {
              showToast({ message: 'Proveedor actualizado con éxito', type: 'success' });
              router.push('/suppliers');
            } else {
              showToast({ message: 'No se pudo actualizar. Usando datos de demostración.', type: 'info' });
              router.push('/suppliers');
            }
          },
          onError: (err) => {
            showToast({ message: err.message || 'Error al actualizar proveedor', type: 'error' });
          },
        }
      );
    } else {
      createMutation.mutate(dto, {
        onSuccess: (res) => {
          if (res) {
            showToast({ message: 'Proveedor creado con éxito', type: 'success' });
            router.push('/suppliers');
          } else {
            showToast({ message: 'No se pudo crear. Revisa la conexión con el servidor.', type: 'error' });
          }
        },
        onError: (err) => {
          showToast({ message: err.message || 'Error al crear proveedor', type: 'error' });
        },
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const watchedFields = watch();

  return (
    <div className={styles.container}>
      <div className={styles.stepperBox}>
        <div className={styles.stepper}>
          {STEPS.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div
                className={clsx(styles.step, {
                  [styles.active]: currentStep === step.id,
                  [styles.completed]: currentStep > step.id,
                })}
              >
                <div className={styles.stepCircle}>
                  {currentStep > step.id ? <Check size={16} /> : step.id}
                </div>
                <span className={styles.stepName}>{step.name}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={clsx(styles.stepLine, { [styles.lineActive]: currentStep > step.id })} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Información legal y de contacto</h2>
              <p className={styles.stepSubtitle}>
                Datos básicos de identificación tributaria y ubicación.
              </p>
            </div>

            <div className={styles.row}>
              <Input
                label="Razón social"
                {...register('legalName')}
                error={(errors.legalName?.message as string) ?? undefined}
                required
              />
              <Input
                label="Nombre comercial"
                {...register('tradeName')}
                error={(errors.tradeName?.message as string) ?? undefined}
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.nitFieldWrapper}>
                <Input
                  label="NIT o RUC"
                  placeholder="Ej: 901362835"
                  {...register('taxId')}
                  error={(errors.taxId?.message as string) ?? nitError ?? undefined}
                  required
                />
                {nitDV !== null && (
                  <div className={styles.dvBadge}>
                    <span>DV</span>
                    <strong>{nitDV}</strong>
                  </div>
                )}
              </div>
              <Select
                label="Tipo de proveedor"
                {...register('type')}
                error={(errors.type?.message as string) ?? undefined}
                required
              >
                <option value="">Seleccione...</option>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className={styles.row}>
              <Select
                label="Tipo de contribuyente"
                {...register('contributorType')}
                error={(errors.contributorType?.message as string) ?? undefined}
                required
              >
                <option value="">Seleccione...</option>
                {CONTRIBUTOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Select
                label="País"
                {...register('country')}
                error={(errors.country?.message as string) ?? undefined}
                required
              >
                <option value="Colombia">Colombia</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Alemania">Alemania</option>
                <option value="China">China</option>
              </Select>
            </div>

            <div className={styles.row}>
              <Input
                label="Departamento / Provincia"
                {...register('state')}
                error={(errors.state?.message as string) ?? undefined}
              />
              <Input
                label="Ciudad"
                {...register('city')}
                error={(errors.city?.message as string) ?? undefined}
                required
              />
            </div>

            <div className={styles.row}>
              <Input
                label="Dirección"
                {...register('address')}
                error={(errors.address?.message as string) ?? undefined}
              />
              <Input
                label="Teléfono"
                placeholder="Ej: (601) 345 6789"
                {...register('phone')}
                error={(errors.phone?.message as string) ?? undefined}
              />
            </div>

            <div className={styles.row}>
              <Input
                label="Correo electrónico"
                type="email"
                {...register('email')}
                error={(errors.email?.message as string) ?? undefined}
              />
              <Input
                label="Persona de contacto"
                {...register('contactName')}
                error={(errors.contactName?.message as string) ?? undefined}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Condiciones comerciales</h2>
              <p className={styles.stepSubtitle}>Términos de negociación y notas.</p>
            </div>

            <div className={styles.row}>
              <Select
                label="Condiciones de pago"
                {...register('paymentTerms')}
                error={(errors.paymentTerms?.message as string) ?? undefined}
              >
                <option value="">Opcional</option>
                {PAYMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Moneda"
                {...register('currency')}
                error={(errors.currency?.message as string) ?? undefined}
              >
                {CURRENCY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className={styles.fieldItemFull}>
              <Input
                label="Sitio web (Opcional)"
                placeholder="https://..."
                {...register('website')}
                error={(errors.website?.message as string) ?? undefined}
              />
            </div>

            <div className={styles.fieldItemFull}>
              <label className={styles.fieldLabel}>Observaciones</label>
              <textarea
                className={styles.textarea}
                {...register('notes')}
                placeholder="Notas adicionales sobre el proveedor..."
              />
            </div>

            <div className={styles.uploadSection}>
              <h4 className={styles.subTitle}>Documentos adjuntos (Opcional - PDF)</h4>
              <div className={styles.dropzone}>
                <Upload className={styles.uploadIcon} />
                <p>Haz clic o arrastra archivos para cargar RUT y Cámara de Comercio</p>
                <span>Máx 5MB por archivo</span>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Revisa la información antes de guardar</h2>
              <p className={styles.stepSubtitle}>Verifica que todos los datos sean correctos.</p>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryCol}>
                <h4 className={styles.summaryTitle}>Información legal</h4>
                <SummaryItem label="Razón social" value={watchedFields.legalName} />
                <SummaryItem label="Nombre comercial" value={watchedFields.tradeName} />
                <SummaryItem
                  label="NIT"
                  value={
                    watchedFields.taxId
                      ? `${watchedFields.taxId}${nitDV !== null ? `-${nitDV}` : ''}`
                      : undefined
                  }
                />
                <SummaryItem
                  label="Tipo"
                  value={TYPE_OPTIONS.find((o) => o.value === watchedFields.type)?.label}
                />
                <SummaryItem
                  label="Ubicación"
                  value={
                    [watchedFields.city, watchedFields.state].filter(Boolean).join(', ') || undefined
                  }
                />
                <SummaryItem label="Contacto" value={watchedFields.contactName} />
              </div>

              <div className={styles.summaryCol}>
                <h4 className={styles.summaryTitle}>Datos comerciales</h4>
                <SummaryItem label="Condiciones pago" value={watchedFields.paymentTerms} />
                <SummaryItem label="Moneda" value={watchedFields.currency} />
                <SummaryItem label="Web" value={watchedFields.website} />
                <SummaryItem label="Observaciones" value={watchedFields.notes} />
              </div>
            </div>

            <div className={styles.alertBox}>
              <Info size={20} />
              <p>
                Una vez creado el proveedor podrá asociarlo a movimientos de inventario de tipo
                entrada por compra.
              </p>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <Button type="button" variant="secondary" onClick={() => router.push('/suppliers')}>
              Cancelar
            </Button>
          </div>
          <div className={styles.rightActions}>
            {currentStep > 1 && (
              <Button type="button" variant="secondary" onClick={handleBack} disabled={isLoading}>
                <ChevronLeft size={18} />
                Anterior
              </Button>
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext}>
                Siguiente
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar proveedor'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className={styles.summaryItem}>
      <span className={styles.summaryLabel}>{label}</span>
      <span className={clsx(styles.summaryValue, { [styles.emptyValue]: !value })}>
        {value || 'No especificado'}
      </span>
    </div>
  );
}
