'use client';

import React from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { Switch } from '@/src/components/ui/Switch';
import styles from './ProfilePage.module.css';

export function NotificationsSection() {
  const { showToast } = useToast();

  const handleToggle = (label: string) => {
    showToast({ message: 'Preferencias guardadas', type: 'info' });
  };

  return (
    <section className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Notificaciones</h3>
        <p className={styles.sectionSubtitle}>Configura qué alertas quieres recibir por correo.</p>
      </div>

      <div className={styles.toggleList}>
        <div className={styles.toggleItem}>
          <div className={styles.toggleText}>
            <span className={styles.toggleLabel}>Alertas de stock bajo</span>
            <span className={styles.toggleDesc}>Recibir correo cuando un producto llega al stock mínimo</span>
          </div>
          <Switch checked={true} onChange={() => handleToggle('Alertas de stock bajo')} />
        </div>

        <div className={styles.toggleItem}>
          <div className={styles.toggleText}>
            <span className={styles.toggleLabel}>Alertas de vencimiento</span>
            <span className={styles.toggleDesc}>Recibir correo cuando un producto está próximo a vencer</span>
          </div>
          <Switch checked={false} onChange={() => handleToggle('Alertas de vencimiento')} />
        </div>

        <div className={styles.toggleItem}>
          <div className={styles.toggleText}>
            <span className={styles.toggleLabel}>Resumen diario</span>
            <span className={styles.toggleDesc}>Recibir un resumen diario del estado del inventario cada mañana</span>
          </div>
          <Switch checked={true} onChange={() => handleToggle('Resumen diario')} />
        </div>

      </div>
    </section>
  );
}
