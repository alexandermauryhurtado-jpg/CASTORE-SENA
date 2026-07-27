'use client';

import React from 'react';
import type { RoleView } from '../types/roles.types';
import { RoleCard } from '@/src/features/users/components/RolesList/RoleCard';
import type { Role } from '@/src/features/users/mockData';
import styles from './RoleGrid.module.css';

interface RoleGridProps {
  roles: RoleView[];
  onDelete: (id: string) => void;
  onClone: (role: RoleView) => void;
}

/** Convierte RoleView a Role para RoleCard (misma estructura) */
function toRole(role: RoleView): Role {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    type: role.type,
    userCount: role.userCount,
    permissions: role.permissions,
    createdAt: role.createdAt,
    lastModified: role.lastModified,
    modifiedBy: role.modifiedBy,
  };
}

export function RoleGrid({ roles, onDelete, onClone }: RoleGridProps) {
  return (
    <div className={styles.grid}>
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={toRole(role)}
          onDelete={onDelete}
          onClone={() => onClone(role)}
        />
      ))}
    </div>
  );
}
