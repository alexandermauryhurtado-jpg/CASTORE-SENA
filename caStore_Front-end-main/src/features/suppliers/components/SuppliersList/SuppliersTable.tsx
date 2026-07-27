'use client';

import React, { useState } from 'react';
import { Eye, Edit3, MapPin, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import styles from './SuppliersTable.module.css';
import type { SupplierWithStatsApi, SupplierTypeApi, ContributorTypeApi } from '../../types/suppliers.types';
const TYPE_LABELS: Record<SupplierTypeApi, string> = {
  NATIONAL: 'Nacional',
  INTERNATIONAL: 'Internacional',
  MANUFACTURER: 'Fabricante',
  DISTRIBUTOR: 'Distribuidor',
};

const CONTRIBUTOR_LABELS: Record<ContributorTypeApi, string> = {
  LARGE: 'Gran Contribuyente',
  COMMON: 'Persona Jurídica',
  SIMPLIFIED: 'Régimen Simplificado',
  NON_CONTRIBUTOR: 'Persona Natural',
};

const TYPE_COLORS: Record<SupplierTypeApi, string> = {
  NATIONAL: styles.badgeBlue,
  INTERNATIONAL: styles.badgeGreen,
  MANUFACTURER: styles.badgeOrange,
  DISTRIBUTOR: styles.badgePurple,
};

interface SuppliersTableProps {
  suppliers: SupplierWithStatsApi[];
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Proveedor</th>
            <th>NIT</th>
            <th>Tipo</th>
            <th>Contribuyente</th>
            <th>Ciudad</th>
            <th>Contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={8} className={styles.emptyCell}>
                <div className={styles.emptyState}>
                  <span>Sin proveedores registrados</span>
                </div>
              </td>
            </tr>
          ) : (
            suppliers.map((s) => (
              <tr key={s.id} className={styles.row}>
                <td>
                  <code className={styles.idCode}>{s.id.slice(-6)}</code>
                </td>
                <td>
                  <div className={styles.providerCell}>
                    <span className={styles.commercialName}>{s.tradeName}</span>
                    <span className={styles.businessName}>{s.legalName}</span>
                    <ContactTooltip supplier={s} />
                  </div>
                </td>
                <td>
                  <code className={styles.nit}>{s.taxId}</code>
                </td>
                <td>
                  <span className={clsx(styles.typeBadge, TYPE_COLORS[s.type])}>
                    {TYPE_LABELS[s.type]}
                  </span>
                </td>
                <td>
                  <span className={styles.taxBadge}>{CONTRIBUTOR_LABELS[s.contributorType]}</span>
                </td>
                <td>
                  <div className={styles.cityCell}>
                    <MapPin size={14} className={styles.pinIcon} />
                    <span>{s.city}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.contactCell}>
                    <span className={styles.contactName}>{s.contactName ?? '—'}</span>
                    <span className={styles.contactEmail}>{s.email ?? '—'}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/suppliers/${s.id}`} title="Ver perfil">
                      <button type="button" className={styles.actionBtn}>
                        <Eye size={18} />
                      </button>
                    </Link>
                    <Link href={`/suppliers/${s.id}/edit`} title="Editar">
                      <button type="button" className={styles.actionBtn}>
                        <Edit3 size={18} />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ContactTooltip({ supplier }: { supplier: SupplierWithStatsApi }) {
  const [visible, setVisible] = useState(false);
  const hasContact =
    supplier.contactName || supplier.phone || supplier.email;

  if (!hasContact) return null;

  return (
    <div
      className={styles.quickContact}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <div className={clsx(styles.tooltip, visible && styles.tooltipVisible)}>
        {supplier.contactName && (
          <div className={styles.tpItem}>
            <User size={12} /> {supplier.contactName}
          </div>
        )}
        {supplier.phone && (
          <div className={styles.tpItem}>
            <Phone size={12} /> {supplier.phone}
          </div>
        )}
        {supplier.email && (
          <div className={styles.tpItem}>
            <Mail size={12} /> {supplier.email}
          </div>
        )}
      </div>
    </div>
  );
}
