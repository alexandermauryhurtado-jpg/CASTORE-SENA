'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { KPICard } from '@/src/features/dashboard/components/KPICard';
import type { User } from '@/src/features/users/types/users.types';
import styles from './UserSummaryCards.module.css';

interface UserSummaryCardsProps {
  users: User[];
  roleCount: number;
}

export function UserSummaryCards({ users, roleCount }: UserSummaryCardsProps) {
  const router = useRouter();
  const total = users.length;
  const active = users.filter((u) => u.status === 'active').length;
  const inactive = total - active;

  return (
    <div className={styles.grid}>
      <KPICard
        title="Total usuarios"
        value={total}
        icon={<Users size={22} />}
        iconColor="var(--color-primary)"
        iconBg="var(--color-primary-soft)"
      />
      <KPICard
        title="Usuarios activos"
        value={active}
        icon={<UserCheck size={22} />}
        iconColor="var(--color-success)"
        iconBg="var(--color-success-bg)"
      />
      <KPICard
        title="Usuarios inactivos"
        value={inactive}
        icon={<UserX size={22} />}
        iconColor="var(--color-error)"
        iconBg="var(--color-error-bg)"
      />
      <KPICard
        title="Roles configurados"
        value={roleCount}
        icon={<Shield size={22} />}
        iconColor="var(--color-info)"
        iconBg="var(--color-info-bg)"
        onClick={() => router.push('/roles')}
      />
    </div>
  );
}
