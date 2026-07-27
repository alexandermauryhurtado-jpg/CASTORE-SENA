'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { AuthForm } from '../components/AuthForm';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número')
      .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
    confirmPassword: z.string().min(1, 'Confirmar contraseña es obligatorio'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';

  const requirements = [
    { label: 'Mínimo 8 caracteres', isMet: passwordValue.length >= 8 },
    { label: 'Una letra mayúscula', isMet: /[A-Z]/.test(passwordValue) },
    { label: 'Un número', isMet: /[0-9]/.test(passwordValue) },
    { label: 'Un carácter especial', isMet: /[^A-Za-z0-9]/.test(passwordValue) },
  ];

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña. El enlace pudo haber expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      // Redirigir al login o dashboard aquí (solo console.log para entorno demo)
      console.log('Redirecting to dashboard...');
      window.location.href = '/login'; 
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown]);

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="font-serif text-[28px] text-[#1E293B]">Nueva contraseña</h2>
        <p className="mt-2 text-[14px] text-[#64748B] font-sans">
          Elige una contraseña segura para tu cuenta
        </p>
      </div>

      {isSuccess ? (
        <div className="flex flex-col gap-6">
          <div className="rounded-[12px] border border-[#DCFCE7] bg-[#F0FDF4] p-6 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#16A34A]" />
            <p className="text-sm font-medium text-[#16A34A] mb-4">
              Contraseña guardada correctamente.
            </p>
            <p className="text-sm text-[#16A34A]">
              Redirigiendo en {countdown}...
            </p>
          </div>
        </div>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)} isLoading={isLoading}>
          {/* New Password Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#1E293B]"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`h-11 w-full rounded-[6px] border bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-[#F8623A] focus:ring-1 focus:ring-[#F8623A]/30 ${
                  errors.password ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password Strength Checklist */}
          <ul className="flex flex-col gap-2 rounded-lg bg-[#F8FAFC] p-4 text-xs">
            {requirements.map((req, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 ${
                  req.isMet ? 'text-[#16A34A]' : 'text-[#64748B]'
                }`}
              >
                {req.isMet ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                <span>{req.label}</span>
              </li>
            ))}
          </ul>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-[#1E293B]"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`h-11 w-full rounded-[6px] border bg-white px-3 py-2 pr-10 text-sm outline-none transition-all focus:border-[#F8623A] focus:ring-1 focus:ring-[#F8623A]/30 ${
                  errors.confirmPassword ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B]"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-[#DC2626]">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-[#FEF2F2] p-3 text-sm text-[#DC2626] border border-[#FCA5A5]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Action */}
          <div className="mt-2">
            <button
              type="submit"
              disabled={isLoading || !requirements.every((r) => r.isMet)}
              className="flex h-11 w-full items-center justify-center rounded-[8px] bg-[#F8623A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#E54E27] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
            </button>
          </div>
        </AuthForm>
      )}
    </AuthLayout>
  );
}
