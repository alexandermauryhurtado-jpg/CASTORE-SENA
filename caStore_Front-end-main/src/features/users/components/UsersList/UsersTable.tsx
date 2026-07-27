'use client';

import React, { useState } from 'react';
import { Edit2, Mail, Power, Send } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

import type { User } from '@/src/features/users/types/users.types';
import { getInitials } from '@/src/features/users/schemas/user.schema';
import { useResendPassword } from '@/src/features/users/hooks/useUsers';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { useToast } from '@/src/components/ui/Toast';

import styles from './UsersTable.module.css';

interface UsersTableProps {
  users: User[];
  onToggleStatus: (id: string, currentStatus: string) => void;
}

type ConfirmModal = {
  id: string;
  name: string;
  type: 'toggle' | 'reset';
  currentStatus?: string;
};

function getRoleBadgeClass(roleName: string): string {
  const r = roleName.toLowerCase();
  if (r.includes('admin')) return styles.badgeAdmin;
  if (r.includes('supervisor')) return styles.badgeSupervisor;
  if (r.includes('operador')) return styles.badgeOperator;
  return styles.badgeCustom;
}

export function UsersTable({ users, onToggleStatus }: UsersTableProps) {
  const { showToast } = useToast();
  const [confirmModal, setConfirmModal] = useState<ConfirmModal | null>(null);
  const resendMutation = useResendPassword({
    onSuccess: (result, id) => {
      const name = confirmModal?.type === 'reset' ? confirmModal.name : '';
      setConfirmModal(null);
      if (result?.success) {
        showToast({
          message: result.message ?? `Contraseña temporal enviada a ${name}`,
          type: 'success',
        });
      } else {
        showToast({
          message: 'No se pudo enviar la contraseña. Intenta de nuevo.',
          type: 'error',
        });
      }
    },
    onError: () => {
      setConfirmModal(null);
      showToast({ message: 'Error al reenviar la contraseña', type: 'error' });
    },
  });

  const handleOpenToggle = (id: string, name: string, currentStatus: string) => {
    setConfirmModal({ id, name, type: 'toggle', currentStatus });
  };

  const handleOpenResetPassword = (id: string, name: string) => {
    setConfirmModal({ id, name, type: 'reset' });
  };

  const executeToggle = () => {
    if (!confirmModal || confirmModal.type !== 'toggle' || confirmModal.currentStatus === undefined) return;
    onToggleStatus(confirmModal.id, confirmModal.currentStatus);
    setConfirmModal(null);
  };

  const executeResendPassword = () => {
    if (!confirmModal || confirmModal.type !== 'reset') return;
    resendMutation.mutate(confirmModal.id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Último Acceso</th>
              <th>Creación</th>
              <th className={styles.actionsHeader}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const initials = getInitials(user.name);
              const isAdmin = user.roleId === 'role-admin';

              return (
                <tr key={user.id} className={styles.row}>
                  <td className={styles.userId}>{user.id.slice(-8)}</td>
                  <td>
                    <div className={styles.userCell}>
                      <div
                        className={styles.avatar}
                        style={{ backgroundColor: user.avatarColor ?? '#FFEDD5' }}
                      >
                        {initials}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={clsx(styles.badge, getRoleBadgeClass(user.roleName))}>
                      {user.roleName || 'Sin rol'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={clsx(styles.statusBadge, {
                        [styles.active]: user.status === 'active',
                        [styles.inactive]: user.status === 'inactive',
                      })}
                    >
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {formatRelativeDate(user.lastAccess)}
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/users/${user.id}`}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="Editar"
                          aria-label="Editar usuario"
                        >
                          <Edit2 size={16} />
                        </button>
                      </Link>

                      <button
                        type="button"
                        className={clsx(styles.iconBtn, styles.resetBtn)}
                        title="Reenviar contraseña"
                        onClick={() => handleOpenResetPassword(user.id, user.name)}
                        aria-label="Reenviar contraseña temporal"
                      >
                        <Mail size={16} />
                        <span className={styles.tooltip}>
                          Reenviar contraseña temporal
                        </span>
                      </button>

                      <div className={styles.toggleWrapper}>
                        <button
                          type="button"
                          className={clsx(styles.toggleBtn, {
                            [styles.toggleActive]: user.status === 'active',
                            [styles.disabled]: isAdmin,
                          })}
                          disabled={isAdmin}
                          onClick={() =>
                            handleOpenToggle(user.id, user.name, user.status)
                          }
                          title={
                            isAdmin
                              ? 'No puedes desactivar a otro administrador'
                              : user.status === 'active'
                                ? 'Desactivar usuario'
                                : 'Activar usuario'
                          }
                          aria-label={
                            user.status === 'active'
                              ? 'Desactivar usuario'
                              : 'Activar usuario'
                          }
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Toggle estado */}
      <Modal
        isOpen={confirmModal?.type === 'toggle' && confirmModal.currentStatus !== undefined}
        onClose={() => setConfirmModal(null)}
        title={
          confirmModal?.type === 'toggle' && confirmModal.currentStatus === 'active'
            ? '¿Desactivar usuario?'
            : '¿Activar usuario?'
        }
        variant="danger"
        footer={
          confirmModal?.type === 'toggle' && confirmModal.currentStatus !== undefined ? (
            <>
              <Button variant="secondary" onClick={() => setConfirmModal(null)}>
                Cancelar
              </Button>
              <Button onClick={executeToggle}>
                {confirmModal.currentStatus === 'active' ? 'Desactivar' : 'Activar'}
              </Button>
            </>
          ) : undefined
        }
      >
        {confirmModal?.type === 'toggle' && confirmModal.currentStatus !== undefined && (
          <p className={styles.modalDesc}>
            {confirmModal.currentStatus === 'active' ? (
              <>
                El usuario <strong>{confirmModal.name}</strong> no podrá acceder al sistema hasta
                que sea activado de nuevo.
              </>
            ) : (
              <>
                El usuario <strong>{confirmModal.name}</strong> podrá volver a acceder al sistema.
              </>
            )}
          </p>
        )}
      </Modal>

      {/* Modal: Reenviar contraseña */}
      <Modal
        isOpen={confirmModal?.type === 'reset'}
        onClose={() => setConfirmModal(null)}
        title="¿Reenviar contraseña temporal?"
        footer={
          confirmModal?.type === 'reset' ? (
            <>
              <Button variant="secondary" onClick={() => setConfirmModal(null)}>
                Cancelar
              </Button>
              <Button
                onClick={executeResendPassword}
                disabled={resendMutation.isPending}
                isLoading={resendMutation.isPending}
              >
                Enviar contraseña
              </Button>
            </>
          ) : undefined
        }
      >
        {confirmModal?.type === 'reset' && (
          <p className={styles.modalDesc}>
            Se generará una nueva contraseña temporal para{' '}
            <strong>{confirmModal.name}</strong> y se enviará al correo registrado. El usuario
            deberá cambiarla en su próximo acceso.
          </p>
        )}
      </Modal>
    </div>
  );
}

function formatRelativeDate(dateStr: string): string {
  if (dateStr === 'never') return 'Nunca';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return 'Nunca';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Hace poco';
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
}
