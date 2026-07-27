'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import { useAuth, getInitials } from '@/src/features/auth/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';

import styles from './Topbar.module.css';

export function UserDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = getInitials(user.name);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    setShowLogoutModal(false);
    setIsOpen(false);
    router.push('/login');
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button 
        className={styles.userTrigger} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.avatarSmall} style={{ backgroundColor: user.avatarColor }}>
          {initials}
        </div>
        <div className={styles.userBrief}>
          <span className={styles.triggerName}>{user.name}</span>
          <span className={styles.triggerRole}>{user.role}</span>
        </div>
        <ChevronDown className={clsx(styles.chevron, { [styles.chevronOpen]: isOpen })} size={16} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownHeader}>
            <div className={styles.avatarLarge} style={{ backgroundColor: user.avatarColor }}>
              {initials}
            </div>
            <div className={styles.headerInfo}>
              <span className={styles.headerName}>{user.name}</span>
              <span className={styles.headerEmail}>{user.email}</span>
              <span className={styles.roleBadge}>{user.role}</span>
            </div>
          </div>

          <div className={styles.dropdownContent}>
            <Link 
              href="/profile" 
              className={styles.dropdownItem}
              onClick={() => setIsOpen(false)}
            >
              <div className={styles.itemIcon}><UserIcon size={18} /></div>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>Mi perfil</span>
                <span className={styles.itemLabel}>Ver y editar tu información</span>
              </div>
            </Link>

            <div className={styles.divider} />

            <button 
              className={clsx(styles.dropdownItem, styles.logoutItem)}
              onClick={() => setShowLogoutModal(true)}
            >
              <div className={styles.itemIcon}><LogOut size={18} /></div>
              <div className={styles.itemText}>
                <span className={styles.itemTitle}>Cerrar sesión</span>
                <span className={styles.itemLabel}>Salir del sistema</span>
              </div>
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="¿Cerrar sesión?"
        variant="warning"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleLogout} isLoading={isLoggingOut}>
              Cerrar sesión
            </Button>
          </>
        }
      >
        <p className={styles.modalDesc}>
          Tu sesión activa será terminada. Tendrás que volver a iniciar sesión para acceder al
          sistema.
        </p>
      </Modal>
    </div>
  );
}
