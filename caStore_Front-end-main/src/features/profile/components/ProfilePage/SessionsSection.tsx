'use client';

import React from 'react';
import { Monitor } from 'lucide-react';
import styles from './ProfilePage.module.css';

/**
 * El backend no expone un listado de sesiones activas ni endpoints para cerrar sesiones remotas.
 * Se muestra un mensaje informativo. Cuando el backend lo soporte, se puede integrar aquí.
 */
export function SessionsSection() {
  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Sesiones activas</h3>
        <p className={styles.sectionSubtitle}>
          Gestiona los dispositivos donde tienes sesión abierta.
        </p>
      </div>

      <div className={styles.sessionsPlaceholder}>
        <Monitor size={32} className={styles.sessionsPlaceholderIcon} />
        <p className={styles.sessionsPlaceholderText}>
          No hay un listado de sesiones disponible por el momento. Para cerrar sesión en este dispositivo, usa &quot;Cerrar sesión&quot; en el menú del usuario.
        </p>
      </div>
    </section>
  );
}
