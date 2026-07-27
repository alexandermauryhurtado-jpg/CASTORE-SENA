'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Check, Circle, Pencil } from 'lucide-react';
import { useProfile } from '@/src/features/profile/hooks/useProfile';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import styles from './ProfilePage.module.css';
import clsx from 'clsx';

const requirements = [
  { id: 'length', text: 'Mínimo 8 caracteres', met: (p: string) => p.length >= 8 },
  { id: 'upper', text: 'Una mayúscula', met: (p: string) => /[A-Z]/.test(p) },
  { id: 'number', text: 'Un número', met: (p: string) => /[0-9]/.test(p) },
  { id: 'special', text: 'Un carácter especial', met: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

const strengthLabels = [
  { label: 'Muy débil', color: styles.strengthRed },
  { label: 'Débil', color: styles.strengthOrange },
  { label: 'Buena', color: styles.strengthYellow },
  { label: 'Fuerte', color: styles.strengthGreen },
];

export function SecuritySection() {
  const { showToast } = useToast();
  const { updatePassword, isUpdatingPassword } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const reqMet = requirements.map((r) => ({ ...r, met: r.met(passwords.new) }));
  const strength = reqMet.filter((r) => r.met).length;
  const canSubmit =
    passwords.current.length > 0 &&
    strength === 4 &&
    passwords.new === passwords.confirm;

  const handleCancel = () => {
    setIsEditing(false);
    setPasswords({ current: '', new: '', confirm: '' });
    setShowPassword({ current: false, new: false, confirm: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirm: passwords.confirm,
      });
      showToast({ message: 'Contraseña actualizada correctamente', type: 'success' });
      handleCancel();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar la contraseña';
      showToast({ message, type: 'error' });
    }
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderRow}>
          <h3 className={styles.sectionTitle}>Seguridad y contraseña</h3>
          {!isEditing && (
            <Button type="button" variant="secondary" onClick={() => setIsEditing(true)} className={styles.editBtn}>
              <Pencil size={14} />
              Editar
            </Button>
          )}
        </div>
        <p className={styles.sectionSubtitle}>
          Te recomendamos usar una contraseña única que no uses en otros sitios.
        </p>
      </div>

      {!isEditing ? (
        <div className={styles.readOnlyBlock}>
          <p className={styles.readOnlyHint}>
            Haz clic en <strong>Editar</strong> para cambiar tu contraseña.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.sectionForm}>
          <div className={styles.passwordGrid}>
            <div className={styles.passwordInputWrapper}>
              <Input
                label="Contraseña actual"
                type={showPassword.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                aria-label={showPassword.current ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.passwordInputWrapper}>
              <Input
                label="Nueva contraseña"
                type={showPassword.new ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                aria-label={showPassword.new ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.passwordInputWrapper}>
              <Input
                label="Confirmar nueva contraseña"
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                required
                error={
                  passwords.confirm && passwords.new !== passwords.confirm
                    ? 'Las contraseñas no coinciden'
                    : ''
                }
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() =>
                  setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                }
                aria-label={showPassword.confirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.requirementsWrapper}>
            <div className={styles.reqList}>
              {reqMet.map((req) => (
                <div
                  key={req.id}
                  className={clsx(styles.reqItem, { [styles.reqMet]: req.met })}
                >
                  {req.met ? <Check size={12} /> : <Circle size={10} />}
                  <span>{req.text}</span>
                </div>
              ))}
            </div>

            <div className={styles.strengthWrapper}>
              <div className={styles.strengthBar}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={clsx(styles.strengthSegment, {
                      [strengthLabels[strength - 1]?.color ?? '']: level <= strength,
                    })}
                  />
                ))}
              </div>
              {strength > 0 && (
                <span
                  className={clsx(
                    styles.strengthLabel,
                    strengthLabels[strength - 1]?.color
                  )}
                >
                  Fortaleza: {strengthLabels[strength - 1]?.label}
                </span>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isUpdatingPassword}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isUpdatingPassword} disabled={!canSubmit}>
              Cambiar contraseña
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
