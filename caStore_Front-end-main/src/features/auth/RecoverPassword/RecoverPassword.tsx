"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { AuthLayout } from "../components/AuthLayout";
import { AuthForm } from "../components/AuthForm";
import { useToast } from "../../../components/ui/Toast";
import { authService } from "../../../services/auth.service";
import styles from "./RecoverPassword.module.css";

const recoverSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
});

type RecoverFormValues = z.infer<typeof recoverSchema>;

export default function RecoverPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

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
      await authService.recoverPassword(data.email);
      setIsSuccess(true);
      showToast({
        message: "Si el correo existe, recibirás el enlace en minutos",
        type: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocurrió un error inesperado al enviar el enlace.";
      setError(message);
      showToast({ message: "Error al enviar el enlace de recuperación", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={styles.backLinkWrapper}>
        <Link href="/login" className={styles.backLink}>
          <ArrowLeft className="h-4 w-4" />
          Volver al login
        </Link>
      </div>

      <div className={styles.pageWrapper}>
        <h2 className={styles.title}>Recuperar contraseña</h2>
        <p className={styles.subtitle}>
          Ingresa tu correo y te enviaremos un enlace de recuperación
        </p>
      </div>

      {isSuccess ? (
        <div className="flex flex-col">
          <div className={styles.successCard}>
            <CheckCircle2 className={styles.successIcon} />
            <p className={styles.successText}>
              Revisa tu bandeja de entrada. Si el correo existe, recibirás el
              enlace en minutos.
            </p>
          </div>
          <Link href="/login" className={styles.ghostButton}>
            Volver al login
          </Link>
        </div>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)} isLoading={isLoading}>
          {/* Email Field */}
          <div className={styles.fieldWrapper}>
            <label htmlFor="email" className={styles.label}>
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              placeholder="roberto@castore.com"
              {...register("email")}
              className={clsx(styles.input, {
                [styles.inputError]: !!errors.email,
              })}
            />
            {errors.email && (
              <span className={styles.errorFieldText}>
                {errors.email.message}
              </span>
            )}
          </div>

          {error && (
            <div className={styles.alertError}>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="m-0 break-words">{error}</p>
            </div>
          )}

          {/* Action */}
          <div className={styles.actionsWrapper}>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.primaryButton}
            >
              {isLoading
                ? "Enviando enlace..."
                : "Enviar enlace de recuperación"}
            </button>
          </div>
        </AuthForm>
      )}
    </AuthLayout>
  );
}
