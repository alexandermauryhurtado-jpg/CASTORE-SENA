'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Shield,
  Check,
  X,
  Info,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import type { User } from '@/src/features/users/types/users.types';
import { userSchema, getInitials, type UserFormData } from '@/src/features/users/schemas/user.schema';
import styles from './UserForm.module.css';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useToast } from '@/src/components/ui/Toast';
import {
  useRolesForSelect,
  useRoleForPermissions,
  useCreateUser,
  useUpdateUser,
} from '@/src/features/users/hooks/useUsers';
import { usersService } from '@/src/services/users.service';

interface UserFormProps {
  initialData?: User | null;
  isEdit?: boolean;
}

export function UserForm({ initialData, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const { roles } = useRolesForSelect();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName || initialData.name,
          email: initialData.email,
          roleId: initialData.roleId,
          status: initialData.status,
        }
      : { status: 'active' },
  });

  const watchedFullName = watch('fullName');
  const watchedRoleId = watch('roleId');
  const watchedEmail = watch('email');

  const { role: selectedRole } = useRoleForPermissions(watchedRoleId || null);
  const initials = useMemo(() => getInitials(watchedFullName ?? ''), [watchedFullName]);

  const createMutation = useCreateUser({
    onSuccess: (data) => {
      if (data) {
        showToast({ message: 'Usuario creado. Se enviaron las credenciales al correo.', type: 'success' });
        router.push('/users');
      } else {
        showToast({ message: 'No se pudo crear el usuario. Revisa los datos o intenta más tarde.', type: 'error' });
      }
    },
    onError: () => {
      showToast({ message: 'Error al crear el usuario', type: 'error' });
    },
  });

  const updateMutation = useUpdateUser({
    onSuccess: (data) => {
      if (data) {
        showToast({ message: 'Usuario actualizado correctamente', type: 'success' });
      } else {
        showToast({ message: 'No se pudo actualizar el usuario.', type: 'error' });
      }
    },
    onError: () => {
      showToast({ message: 'Error al actualizar el usuario', type: 'error' });
    },
  });

  useEffect(() => {
    if (!watchedEmail || watchedEmail === initialData?.email) {
      setEmailStatus('idle');
      return;
    }
    setEmailStatus('checking');
    const timer = setTimeout(() => {
      usersService
        .checkEmailExists(watchedEmail, isEdit ? initialData?.id : undefined)
        .then((exists) => setEmailStatus(exists ? 'taken' : 'available'))
        .catch(() => setEmailStatus('idle'));
    }, 500);
    return () => clearTimeout(timer);
  }, [watchedEmail, initialData?.email, initialData?.id, isEdit]);

  const onSubmit = (data: UserFormData) => {
    if (emailStatus === 'taken') return;
    if (isEdit && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        dto: { fullName: data.fullName, email: data.email, roleId: data.roleId },
      });
    } else {
      createMutation.mutate({
        fullName: data.fullName,
        email: data.email,
        roleId: data.roleId,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{isEdit ? 'Editar usuario' : 'Crear usuario'}</h1>
          {isEdit && initialData && (
            <p className={styles.subtitle}>{initialData.email}</p>
          )}
        </div>
        <Button variant="secondary" type="button" onClick={() => router.push('/users')}>
          <ArrowLeft size={18} />
          Volver
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.layout}>
        <div className={styles.formCol}>
          <div className={styles.card}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarLarge}>{initials}</div>
              <p className={styles.avatarLabel}>Vista previa del avatar</p>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Datos personales</h3>
              <div className={styles.fieldGrid}>
                <Input
                  label="Nombre completo"
                  {...register('fullName')}
                  error={errors.fullName?.message}
                  required
                  placeholder="Ej: Juan Pérez"
                />
                <div className={styles.emailWrapper}>
                  <Input
                    label="Correo electrónico"
                    {...register('email')}
                    error={
                      errors.email?.message ||
                      (emailStatus === 'taken' ? 'Este correo ya está registrado' : '')
                    }
                    required
                    placeholder="juan@castore.com"
                  />
                  {emailStatus === 'checking' && <div className={styles.emailLoading} />}
                  {emailStatus === 'available' && (
                    <Check className={styles.emailCheck} size={16} aria-hidden />
                  )}
                  {emailStatus === 'taken' && (
                    <X className={styles.emailTaken} size={16} aria-hidden />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Seguridad y acceso</h3>
              <div className={styles.fieldGrid}>
                <div className={styles.fieldBlock}>
                  <label htmlFor="roleId" className={styles.fieldLabel}>
                    Rol del sistema <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="roleId"
                    className={styles.select}
                    {...register('roleId')}
                    aria-invalid={Boolean(errors.roleId)}
                    aria-describedby={errors.roleId ? 'roleId-error' : undefined}
                  >
                    <option value="">Seleccione un rol...</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && (
                    <span id="roleId-error" className={styles.fieldError}>
                      {errors.roleId.message}
                    </span>
                  )}
                </div>
              </div>

              {!isEdit && (
                <div className={styles.infoAlert}>
                  <Info size={18} aria-hidden />
                  <p>
                    Al crear el usuario se enviará una contraseña temporal automáticamente al
                    correo registrado.
                  </p>
                </div>
              )}

              {isEdit && initialData?.id === 'usr-001' && (
                <div className={styles.warningAlert}>
                  <ShieldAlert size={18} aria-hidden />
                  <p>
                    Estás editando tu propio perfil. Cambiar tu rol puede afectar tu acceso al
                    sistema.
                  </p>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <Button type="button" variant="secondary" onClick={() => router.push('/users')}>
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={emailStatus === 'taken'}
              >
                {isEdit ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.previewCol}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div className={styles.previewIcon}>
                <Shield size={20} aria-hidden />
              </div>
              <div>
                <h3 className={styles.previewTitle}>Permisos del rol seleccionado</h3>
                <p className={styles.previewSubtitle}>
                  {selectedRole
                    ? `Heredados de: ${selectedRole.name}`
                    : 'Selecciona un rol para ver sus alcances'}
                </p>
              </div>
            </div>

            {!selectedRole ? (
              <div className={styles.emptyPreview}>
                <Shield size={48} aria-hidden />
                <p>Selecciona un rol para ver la matriz de permisos detallada</p>
              </div>
            ) : (
              <div className={styles.permissionMatrix}>
                {Object.entries(selectedRole.permissions).map(([moduleId, perms]) => (
                  <div key={moduleId} className={styles.matrixRow}>
                    <span className={styles.moduleName}>
                      {moduleId.charAt(0).toUpperCase() + moduleId.slice(1)}
                    </span>
                    <div className={styles.permsList}>
                      <PermIndicator active={perms.consult} label="C" />
                      <PermIndicator active={perms.create} label="R" />
                      <PermIndicator active={perms.update} label="U" />
                      <PermIndicator active={perms.delete} label="D" />
                    </div>
                  </div>
                ))}
                <div className={styles.previewFooter}>
                  <Link
                    href={`/roles/${selectedRole.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.roleLink}
                  >
                    Ver y editar este rol <ExternalLink size={14} aria-hidden />
                  </Link>
                  {selectedRole.type === 'system' && (
                    <div className={styles.systemBadge}>
                      Rol del sistema
                      <div className={styles.badgeTooltip}>
                        Los roles de sistema no pueden modificarse
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function PermIndicator({
  active,
  label,
}: {
  active: boolean;
  label: string;
}) {
  return (
    <div className={clsx(styles.permItem, { [styles.permActive]: active })}>
      {active ? <Check size={10} aria-hidden /> : <X size={10} aria-hidden />}
      <span>{label}</span>
    </div>
  );
}
