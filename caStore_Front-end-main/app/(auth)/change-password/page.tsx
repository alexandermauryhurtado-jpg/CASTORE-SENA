'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '../../../src/lib/api';
import { AuthLayout } from '../../../src/features/auth/components/AuthLayout';
import { AuthForm } from '../../../src/features/auth/components/AuthForm';
import { useAuth } from '../../../src/hooks/useAuth';
import { useToast } from '../../../src/components/ui/Toast';
import styles from './ChangePassword.module.css';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña temporal es obligatoria'),
  newPassword: z.string()
    .min(8, 'Debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
  confirm: z.string().min(1, 'Debes confirmar la contraseña'),
}).refine((data) => data.newPassword === data.confirm, {
  message: "Las contraseñas no coinciden",
  path: ["confirm"],
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const { refreshUser } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = watch('newPassword', '');

  const requirements = [
    { label: 'Mínimo 8 caracteres', met: newPassword.length >= 8 },
    { label: 'Al menos una mayúscula', met: /[A-Z]/.test(newPassword) },
    { label: 'Al menos un número', met: /[0-9]/.test(newPassword) },
  ];

  const onSubmit = async (data: ChangePasswordValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirm: data.confirm,
      });
      await refreshUser();
      showToast({ message: 'Contraseña actualizada correctamente', type: 'success' });
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: unknown } } }).response?.data?.message;
      const message = msg ? String(msg) : 'Error al cambiar la contraseña';
      setError(message);
      showToast({ message: 'Error al cambiar la contraseña', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.header}>
        <h2 className={styles.title}>Configura tu contraseña</h2>
        <p className={styles.subtitle}>
          Es tu primer acceso. Debes establecer una contraseña personal antes de continuar.
        </p>
      </div>

      <AuthForm onSubmit={handleSubmit(onSubmit)} isLoading={isLoading}>
        {/* Current Password */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Contraseña temporal</label>
          <div className={styles.inputRelative}>
            <input
              type={showCurrent ? 'text' : 'password'}
              placeholder="Contraseña del correo"
              {...register('currentPassword')}
              className={styles.input}
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className={styles.iconButton}>
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className={styles.hint}>La contraseña que recibiste por correo electrónico</p>
          {errors.currentPassword && <span className={styles.errorText}>{errors.currentPassword.message}</span>}
        </div>

        {/* New Password */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Nueva contraseña</label>
          <div className={styles.inputRelative}>
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('newPassword')}
              className={styles.input}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className={styles.iconButton}>
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <span className={styles.errorText}>{errors.newPassword.message}</span>}
        </div>

        {/* Requirements Checklist */}
        <div className={styles.checklist}>
          {requirements.map((req, idx) => (
            <div key={idx} className={styles.checkItem}>
              {req.met ? <Check size={14} className={styles.success} /> : <X size={14} className={styles.pending} />}
              <span className={req.met ? styles.successText : styles.pendingText}>{req.label}</span>
            </div>
          ))}
        </div>

        {/* Confirm Password */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Confirmar contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('confirm')}
            className={styles.input}
          />
          {errors.confirm && <span className={styles.errorText}>{errors.confirm.message}</span>}
        </div>

        {error && (
          <div className={styles.alertError}>
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading} className={styles.primaryButton}>
          {isLoading ? 'Guardando...' : 'Establecer contraseña'}
        </button>
      </AuthForm>
    </AuthLayout>
  );
}
