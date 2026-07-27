'use client';

import React from 'react';
import { 
  Users, 
  Copy, 
  Edit3, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { Role } from '../../mockData';
import styles from './RoleCard.module.css';

interface RoleCardProps {
  role: Role;
  onDelete: (id: string) => void;
  onClone: (role: Role) => void;
}

export function RoleCard({ role, onDelete, onClone }: RoleCardProps) {
  const isSystem = role.type === 'system';
  const hasUsers = role.userCount > 0;

  const getCategorizedPermissions = () => {
    const modules = Object.entries(role.permissions);
    
    const full: { id: string; name: string }[] = [];
    const partial: { id: string; name: string; count: number }[] = [];
    const none: { id: string; name: string }[] = [];

    const nameMap: Record<string, string> = {
      dashboard: 'Dashboard',
      products: 'Productos',
      categories: 'Categorías',
      movements: 'Movimientos',
      alerts: 'Alertas',
      suppliers: 'Proveedores',
      users: 'Usuarios',
      locations: 'Ubicaciones'
    };

    modules.forEach(([id, perms]) => {
      const count = Object.values(perms).filter(Boolean).length;
      const name = nameMap[id] || id;
      
      if (count === 4) full.push({ id, name });
      else if (count === 0) none.push({ id, name });
      else partial.push({ id, name, count });
    });

    return { full, partial, none };
  };

  const { full, partial, none } = getCategorizedPermissions();

  const renderChips = (list: any[], type: 'full' | 'partial' | 'none') => {
    const limit = 3;
    const show = list.slice(0, limit);
    const extra = list.length - limit;

    return (
      <div className={styles.chipRow}>
        {show.map((item) => (
          <span key={item.id} className={clsx(styles.chip, styles[type])}>
            {item.name} {type === 'partial' && `${item.count}/4`}
          </span>
        ))}
        {extra > 0 && (
          <div className={styles.extraChipWrapper}>
            <span className={clsx(styles.chip, styles.more)}>+{extra} más</span>
            <div className={styles.extraTooltip}>
               {list.slice(limit).map(item => (
                 <div key={item.id}>{item.name} {type === 'partial' && `${item.count}/4`}</div>
               ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.card}>
      <Link href={`/roles/${role.id}`} className={styles.cardLink}>
        <header className={styles.header}>
          <div className={styles.titleStack}>
            <h3 className={styles.roleName}>{role.name}</h3>
            <span className={clsx(styles.typeBadge, isSystem ? styles.system : styles.custom)}>
              {isSystem ? 'Sistema' : 'Personalizado'}
            </span>
          </div>
          
          <div className={clsx(styles.userCounter, { [styles.hasUsers]: hasUsers })}>
            <div className={styles.counterContent}>
              <Users size={14} />
              <span>{role.userCount} {role.userCount === 1 ? 'usuario' : 'usuarios'}</span>
            </div>
            {hasUsers && (
              <div className={styles.usersHoverList}>
                <p>Ver usuarios con este rol</p>
              </div>
            )}
          </div>
        </header>

        <div className={styles.cardBody}>
          <div className={styles.permissionSection}>
            {full.length > 0 && renderChips(full, 'full')}
            {partial.length > 0 && renderChips(partial, 'partial')}
            {none.length > 0 && renderChips(none, 'none')}
          </div>
        </div>
      </Link>

      <footer className={styles.footer}>
        {isSystem ? (
          <button 
            className={styles.btnSecondary} 
            onClick={(e) => { e.preventDefault(); onClone(role); }}
          >
            <Copy size={16} />
            <span>Clonar</span>
          </button>
        ) : (
          <div className={styles.customActions}>
            <Link href={`/roles/${role.id}/edit`} className={styles.btnLink}>
              <button className={styles.btnSecondary}>
                <Edit3 size={16} />
                <span>Editar</span>
              </button>
            </Link>
            <button 
              className={clsx(styles.btnDelete, { [styles.disabled]: hasUsers })}
              disabled={hasUsers}
              onClick={() => onDelete(role.id)}
            >
              <Trash2 size={16} />
              <span>Eliminar</span>
              {hasUsers && (
                <div className={styles.deleteTooltip}>
                  Reasigna los {role.userCount} usuarios antes de eliminar
                </div>
              )}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
