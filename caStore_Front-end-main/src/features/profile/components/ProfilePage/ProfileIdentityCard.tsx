'use client';

import React from 'react';
import {
  Camera,
  Mail,
  Calendar,
  Activity,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { getInitials } from '@/src/features/users/schemas/user.schema';
import { useToast } from '@/src/components/ui/Toast';
import type { AuthUser } from '@/src/features/auth/types/auth.types';
import styles from './ProfilePage.module.css';

interface ProfileIdentityCardProps {
  user: AuthUser;
}

export function ProfileIdentityCard({ user }: ProfileIdentityCardProps) {
  const { showToast } = useToast();
  const initials = getInitials(user.fullName);

  return (
    <div className={styles.identityCard}>
      <div className={styles.avatarWrapper}>
        <div className={styles.avatarLarge}>
          {initials}
        </div>
        <button
          type="button"
          className={styles.changePicBtn}
          onClick={() =>
            showToast({ message: 'Funcionalidad próximamente disponible', type: 'info' })
          }
        >
          <Camera size={16} />
          <span>Cambiar foto</span>
        </button>
      </div>

      <div className={styles.mainInfo}>
        <h2 className={styles.userName}>{user.fullName}</h2>
        <div className={styles.emailRow}>
          <Mail size={14} />
          <span>{user.email}</span>
        </div>
        <div className={styles.roleBadge}>{user.roleName}</div>
      </div>

      <div className={styles.membershipInfo}>
        <Calendar size={14} />
        <span>Miembro desde —</span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <div className={styles.statHeader}>
            <Activity size={14} />
            <span>Movimientos</span>
          </div>
          <span className={styles.statValue}>—</span>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statHeader}>
            <Clock size={14} />
            <span>Última sesión</span>
          </div>
          <span className={styles.statValue}>—</span>
        </div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusLabel}>Estado de la cuenta</div>
        <div className={styles.accountStatus}>
          <ShieldCheck size={16} />
          <span>Activo</span>
        </div>
      </div>
    </div>
  );
}
