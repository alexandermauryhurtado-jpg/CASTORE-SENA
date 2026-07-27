'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  CreditCard,
  User,
  Edit3,
  FileText,
  History,
  Info,
  Package,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import styles from './SupplierProfile.module.css';
import type { SupplierWithStatsApi, SupplierTypeApi } from '../../types/suppliers.types';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { useToast } from '@/src/components/ui/Toast';
import { Pagination } from '@/src/components/tables/Pagination';
import { Input } from '@/src/components/ui/Input';
import { useSupplierPurchases, useDeleteSupplier } from '../../hooks/useSuppliers';

const TYPE_LABELS: Record<SupplierTypeApi, string> = {
  NATIONAL: 'Nacional',
  INTERNATIONAL: 'Internacional',
  MANUFACTURER: 'Fabricante',
  DISTRIBUTOR: 'Distribuidor',
};

const CONTRIBUTOR_LABELS: Record<string, string> = {
  LARGE: 'Gran Contribuyente',
  COMMON: 'Persona Jurídica',
  SIMPLIFIED: 'Régimen Simplificado',
  NON_CONTRIBUTOR: 'Persona Natural',
};

interface SupplierProfileProps {
  supplier: SupplierWithStatsApi;
}

const SOFT_DELETE_MESSAGE =
  'El proveedor se desactivará y ya no aparecerá en el listado activo. El historial de compras se preserva. ¿Continuar?';

export function SupplierProfile({ supplier }: SupplierProfileProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'history' | 'documents'>('general');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const deleteMutation = useDeleteSupplier();

  const handleDeleteClick = () => {
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = () => {
    deleteMutation.mutate(supplier.id, {
      onSuccess: () => {
        setShowDeactivateModal(false);
        showToast({
          message: 'Proveedor desactivado. El historial de compras se preserva.',
          type: 'success',
        });
        router.push('/suppliers');
      },
      onError: (err) => {
        setShowDeactivateModal(false);
        showToast({ message: err.message || 'Error al desactivar proveedor', type: 'error' });
      },
    });
  };

  const initials = supplier.tradeName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.headerCard}>
        <div className={styles.headerMain}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.headerInfo}>
            <div className={styles.titleRow}>
              <h1 className={styles.commercialName}>{supplier.tradeName}</h1>
              <span className={clsx(styles.typeBadge, getBadgeClass(supplier.type))}>
                {TYPE_LABELS[supplier.type]}
              </span>
            </div>
            <p className={styles.businessName}>{supplier.legalName}</p>
            <div className={styles.compactGrid}>
              <div className={styles.compactItem}>
                <MapPin size={14} /> {supplier.city}, {supplier.country}
              </div>
              {supplier.email && (
                <div className={styles.compactItem}>
                  <Mail size={14} /> {supplier.email}
                </div>
              )}
              {supplier.phone && (
                <div className={styles.compactItem}>
                  <Phone size={14} /> {supplier.phone}
                </div>
              )}
              {supplier.website && (
                <div className={styles.compactItem}>
                  <Globe size={14} />
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Sitio web <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/suppliers/${supplier.id}/edit`}>
            <Button variant="secondary">
              <Edit3 size={18} />
              Editar proveedor
            </Button>
          </Link>
          <Button
            variant="secondary"
            className={styles.deleteBtn}
            onClick={handleDeleteClick}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={18} />
            Desactivar proveedor
          </Button>
        </div>
      </div>

      <div className={styles.tabsRoot}>
        <div className={styles.tabsList}>
          <button
            type="button"
            className={clsx(styles.tabTrigger, { [styles.active]: activeTab === 'general' })}
            onClick={() => setActiveTab('general')}
          >
            <Info size={18} /> Información general
          </button>
          <button
            type="button"
            className={clsx(styles.tabTrigger, { [styles.active]: activeTab === 'history' })}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} /> Historial de compras
          </button>
          <button
            type="button"
            className={clsx(styles.tabTrigger, { [styles.active]: activeTab === 'documents' })}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={18} /> Documentos
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'general' && <GeneralInfo supplier={supplier} />}
          {activeTab === 'history' && <PurchaseHistoryTab supplierId={supplier.id} />}
          {activeTab === 'documents' && <DocumentsList />}
        </div>
      </div>

      <Modal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Desactivar proveedor"
        variant="warning"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeactivateModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeactivate}
              disabled={deleteMutation.isPending}
              isLoading={deleteMutation.isPending}
            >
              Confirmar desactivación
            </Button>
          </>
        }
      >
        <p className={styles.modalBodyText}>{SOFT_DELETE_MESSAGE}</p>
      </Modal>
    </div>
  );
}

function GeneralInfo({ supplier }: { supplier: SupplierWithStatsApi }) {
  return (
    <div className={styles.infoTab}>
      <div className={styles.infoCols}>
        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Datos de identificación</h3>
          <div className={styles.detailList}>
            <DetailItem label="NIT" value={supplier.taxId} />
            <DetailItem label="Tipo de proveedor" value={TYPE_LABELS[supplier.type]} />
            <DetailItem
              label="Tipo de contribuyente"
              value={CONTRIBUTOR_LABELS[supplier.contributorType] ?? supplier.contributorType}
            />
            <DetailItem
              label="Fecha de registro"
              value={new Date(supplier.createdAt).toLocaleDateString('es-CO')}
            />
          </div>

          <h3 className={styles.sectionTitle}>Ubicación</h3>
          <div className={styles.detailList}>
            <DetailItem label="País" value={supplier.country} />
            <DetailItem label="Departamento" value={supplier.state ?? '—'} />
            <DetailItem label="Ciudad" value={supplier.city} />
            <DetailItem label="Dirección" value={supplier.address ?? '—'} />
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3 className={styles.sectionTitle}>Datos comerciales</h3>
          <div className={styles.detailList}>
            <DetailItem
              icon={<Calendar size={16} />}
              label="Condiciones de pago"
              value={supplier.paymentTerms ?? '—'}
            />
            <DetailItem
              icon={<CreditCard size={16} />}
              label="Moneda de negociación"
              value={supplier.currency}
            />
            <DetailItem
              icon={<User size={16} />}
              label="Persona de contacto"
              value={supplier.contactName ?? '—'}
            />
            <DetailItem icon={<Mail size={16} />} label="Correo contacto" value={supplier.email ?? '—'} />
            <DetailItem icon={<Phone size={16} />} label="Teléfono contacto" value={supplier.phone ?? '—'} />
          </div>

          {supplier.notes && (
            <div className={styles.observationsContainer}>
              <h3 className={styles.sectionTitle}>Observaciones</h3>
              <div className={styles.obsCard}>{supplier.notes}</div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.statsSection}>
        <h3 className={styles.sectionTitle}>Estadísticas de compras</h3>
        <div className={styles.statsGrid}>
          <StatCard label="Movimientos de compra" value={String(supplier.totalMovements)} />
          <StatCard label="Unidades recibidas" value={String(supplier.totalUnits)} />
          <StatCard
            label="Última compra"
            value={
              supplier.lastPurchaseDate
                ? new Date(supplier.lastPurchaseDate).toLocaleDateString('es-CO')
                : '—'
            }
          />
          <div className={styles.mostBoughtCard}>
            <span className={styles.statLabel}>Resumen</span>
            <div className={styles.mbProduct}>
              <div className={styles.mbIcon}>
                <Package size={20} />
              </div>
              <span className={styles.statValue}>
                {supplier.totalMovements} movimientos · {supplier.totalUnits} unidades
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseHistoryTab({ supplierId }: { supplierId: string }) {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const limit = 10;

  const { data: purchases, pagination, isLoading } = useSupplierPurchases(
    supplierId,
    { page, limit, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined },
    { enabled: true }
  );

  const hasFilters = dateFrom || dateTo;
  const empty = !isLoading && purchases.length === 0;

  return (
    <div className={styles.historyTab}>
      <div className={styles.filtersRow}>
        <Input
          type="date"
          label="Desde"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          label="Hasta"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {empty ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <History size={48} />
          </div>
          <h3>Sin historial de compras</h3>
          <p>
            {hasFilters
              ? 'No hay registros en el rango de fechas seleccionado.'
              : 'Aún no se han registrado recepciones de este proveedor.'}
          </p>
          {!hasFilters && (
            <Link href="/movements/new">
              <Button>Registrar primera entrada</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Und.</th>
                  <th>Total</th>
                  <th>Documento</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((row) => (
                  <tr key={row.id} className={styles.tableRow}>
                    <td>{new Date(row.createdAt).toLocaleDateString('es-CO')}</td>
                    <td>
                      <div className={styles.productCell}>
                        <span>{row.productName}</span>
                        <small>{row.productSku}</small>
                      </div>
                    </td>
                    <td>{row.quantity}</td>
                    <td>{row.unitCost != null ? formatCOP(row.unitCost) : '—'}</td>
                    <td>{row.totalCost != null ? formatCOP(row.totalCost) : '—'}</td>
                    <td>{row.docReference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.total > limit && (
            <div className={styles.paginationBox}>
              <Pagination
                currentPage={pagination.page}
                totalCount={pagination.total}
                pageSize={pagination.limit}
                onPageChange={setPage}
                onPageSizeChange={() => {}}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DocumentsList() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <FileText size={48} />
      </div>
      <h3>Sin documentos</h3>
      <p>No hay archivos adjuntos para este proveedor.</p>
      <Button variant="secondary">Cargar primer documento</Button>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.detailItem}>
      <div className={styles.itemLabelBox}>
        {icon && <span className={styles.itemIcon}>{icon}</span>}
        <span className={styles.itemLabel}>{label}</span>
      </div>
      <span className={styles.itemValue}>{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

function getBadgeClass(type: SupplierTypeApi): string {
  switch (type) {
    case 'NATIONAL':
      return styles.badgeBlue;
    case 'INTERNATIONAL':
      return styles.badgeGreen;
    case 'MANUFACTURER':
      return styles.badgeOrange;
    case 'DISTRIBUTOR':
      return styles.badgePurple;
    default:
      return '';
  }
}

const formatCOP = (val: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val);
