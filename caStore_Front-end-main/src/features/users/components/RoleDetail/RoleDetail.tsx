'use client';

import React from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Edit3, 
  Trash2, 
  Calendar, 
  History, 
  Users as UsersIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Role, mockUsers } from '../../mockData';
import { PermissionMatrix } from '../RoleForm/PermissionMatrix';
import { Button } from '../../../../components/ui/Button';
import styles from './RoleDetail.module.css';

interface RoleDetailProps {
  role: Role;
  onDelete?: (id: string) => void;
  onClone?: (role: Role) => void;
}

export function RoleDetail({ role, onDelete, onClone }: RoleDetailProps) {
  const router = useRouter();
  const isSystem = role.type === 'system';
  
  // Get users for this specific role
  const roleUsers = mockUsers.filter(u => u.roleId === role.id);

  // Generate textual summary
  const getNaturalSummary = () => {
    const modules = Object.values(role.permissions);
    const full = modules.filter(m => Object.values(m).filter(Boolean).length === 4).length;
    const none = modules.filter(m => Object.values(m).filter(Boolean).length === 0).length;
    const partial = modules.length - full - none;

    return {
      text: `Este rol tiene acceso completo a ${full} módulos, acceso parcial a ${partial} módulos y sin acceso a ${none} módulos.`,
      counts: { full, partial, none }
    };
  };

  const summary = getNaturalSummary();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <Link href="/roles" className={styles.backLink}>
            <ArrowLeft size={20} />
            <span>Volver a roles</span>
          </Link>
          <div className={styles.nameGroup}>
            <h1 className={styles.title}>{role.name}</h1>
            <span className={clsx(styles.badge, isSystem ? styles.badgeSystem : styles.badgeCustom)}>
              {isSystem ? 'Rol del Sistema' : 'Rol Personalizado'}
            </span>
          </div>
        </div>

        <div className={styles.headerActions}>
          {isSystem ? (
            <Button variant="secondary" onClick={() => onClone?.(role)}>
              <Copy size={18} />
              <span>Clonar este rol</span>
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => router.push(`/roles/${role.id}/edit`)}>
                <Edit3 size={18} />
                <span>Editar rol</span>
              </Button>
              <Button
                variant="danger"
                disabled={roleUsers.length > 0}
                onClick={() => onDelete?.(role.id)}
              >
                <Trash2 size={18} />
                <span>Eliminar</span>
              </Button>
            </>
          )}
        </div>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <Calendar size={16} />
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Creado el</span>
            <span className={styles.statValue}>{formatDate(role.createdAt)}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <History size={16} />
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Última modificación</span>
            <span className={styles.statValue}>
              {role.lastModified ? formatDate(role.lastModified) : 'Sin cambios'}
              {role.modifiedBy && ` por ${role.modifiedBy}`}
            </span>
          </div>
        </div>
        <div className={styles.statCard}>
          <UsersIcon size={16} />
          <div className={styles.statContent}>
            <span className={styles.statLabel}>Usuarios asignados</span>
            <Link href={`/users?role=${role.id}`} className={styles.statLink}>
              {roleUsers.length} {roleUsers.length === 1 ? 'usuario' : 'usuarios'}
            </Link>
          </div>
        </div>
      </div>

      <section className={styles.matrixSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Matriz de Permisos Detallada</h2>
        </div>
        <PermissionMatrix permissions={role.permissions} readonly />
        
        <div className={styles.summaryFooter}>
           <div className={styles.summaryBox}>
              <AlertCircle size={20} className={styles.summaryIcon} />
              <p className={styles.summaryText}>{summary.text}</p>
           </div>
        </div>
      </section>

      {roleUsers.length > 0 && (
        <section className={styles.usersSection}>
          <h2 className={styles.sectionTitle}>Usuarios con este rol</h2>
          <div className={styles.usersList}>
            {roleUsers.slice(0, 5).map(user => (
              <div key={user.id} className={styles.userAvatar} title={user.name}>
                 {user.name.charAt(0)}
              </div>
            ))}
            {roleUsers.length > 5 && (
              <div className={styles.moreUsers}>
                +{roleUsers.length - 5}
              </div>
            )}
            <Link href={`/users?role=${role.id}`} className={styles.viewAllLink}>
              Ver todos los usuarios →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
