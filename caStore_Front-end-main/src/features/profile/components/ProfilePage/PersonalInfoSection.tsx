'use client';

import React, { useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { profilePersonalSchema, type ProfilePersonalFormData } from '@/src/features/profile/schemas/profile.schema';
import type { AuthUser } from '@/src/features/auth/types/auth.types';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import styles from './ProfilePage.module.css';

interface PersonalInfoSectionProps {
  user: AuthUser;
}

export function PersonalInfoSection({ user }: PersonalInfoSectionProps) {
  const { showToast } = useToast();
  const { updateProfile, isUpdatingProfile, refetch } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfilePersonalFormData>({
    resolver: zodResolver(profilePersonalSchema) as Resolver<ProfilePersonalFormData>,
    defaultValues: { fullName: user.fullName },
  });

  const onEdit = () => {
    reset({ fullName: user.fullName });
    setIsEditing(true);
  };

  const onCancel = () => {
    reset({ fullName: user.fullName });
    setIsEditing(false);
  };

  const onSubmit = async (data: ProfilePersonalFormData) => {
    try {
      await updateProfile({ fullName: data.fullName });
      showToast({ message: 'Perfil actualizado correctamente', type: 'success' });
      refetch();
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar el perfil';
      showToast({ message, type: 'error' });
    }
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeaderRow}>
        <h3 className={styles.sectionTitle}>Información personal</h3>
        {!isEditing && (
          <Button type="button" variant="secondary" onClick={onEdit} className={styles.editBtn}>
            <Pencil size={14} />
            Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.sectionForm}>
          <div className={styles.fieldGrid}>
            <Input
              label="Nombre completo"
              {...register('fullName')}
              error={errors.fullName?.message}
            />
            <div className={styles.readOnlyField}>
              <span className={styles.readOnlyLabel}>Correo electrónico</span>
              <span className={styles.readOnlyValue}>{user.email}</span>
              <p className={styles.readOnlyHint}>El correo es informativo y no se puede modificar desde el perfil.</p>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isUpdatingProfile}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isUpdatingProfile}>
              Guardar cambios
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.readOnlyBlock}>
          <div className={styles.readOnlyField}>
            <span className={styles.readOnlyLabel}>Nombre completo</span>
            <span className={styles.readOnlyValue}>{user.fullName}</span>
          </div>
          <div className={styles.readOnlyField}>
            <span className={styles.readOnlyLabel}>Correo electrónico</span>
            <span className={styles.readOnlyValue}>{user.email}</span>
            <p className={styles.readOnlyHint}>El correo es informativo y no se puede modificar desde el perfil.</p>
          </div>
        </div>
      )}
    </section>
  );
}
