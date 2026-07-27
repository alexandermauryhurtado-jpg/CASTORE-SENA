'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { AuthForm } from '../components/AuthForm';

const recoverSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type RecoverFormValues = z.infer<typeof recoverSchema>;

export default function RecoverPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(recoverSchema),
  });

  const onSubmit = async (data: RecoverFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al enviar el enlace.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6 flex">
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al login
        </a>
      </div>

      <div className="mb-8">
        <h2 className="font-serif text-[28px] text-[#1E293B]">Recuperar contraseña</h2>
        <p className="mt-2 text-[14px] text-[#64748B] font-sans">
          Ingresa tu correo y te enviaremos un enlace de recuperación
        </p>
      </div>

      {isSuccess ? (
        <div className="flex flex-col gap-6">
          <div className="rounded-[12px] border border-[#DCFCE7] bg-[#F0FDF4] p-6 text-center shadow-sm">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#16A34A]" />
            <p className="text-sm font-medium text-[#16A34A]">
              Revisa tu bandeja de entrada. Si el correo existe, recibirás el enlace en minutos.
            </p>
          </div>
          <a
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-[8px] bg-transparent px-4 text-sm font-semibold text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
          >
            Volver al login
          </a>
        </div>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)} isLoading={isLoading}>
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#1E293B]"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="roberto@castore.com"
              {...register('email')}
              className={`h-11 rounded-[6px] border bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[#F8623A] focus:ring-1 focus:ring-[#F8623A]/30 ${
                errors.email ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
              }`}
            />
            {errors.email && (
              <span className="text-xs text-[#DC2626]">
                {errors.email.message}
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
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center rounded-[8px] bg-[#F8623A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#E54E27] disabled:opacity-70"
            >
              {isLoading ? 'Enviando enlace...' : 'Enviar enlace de recuperación'}
            </button>
          </div>
        </AuthForm>
      )}
    </AuthLayout>
  );
}
