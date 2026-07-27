import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Package, Calendar, AlertTriangle, Info, ExternalLink, CalendarClock } from 'lucide-react';
import clsx from 'clsx';
import styles from './AlertDetail.module.css';
import { mockAlerts, Alert } from '../../mockData';
import { mockProducts } from '../../../products/mockData';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';

interface AlertDetailProps {
  id: string;
}

export function AlertDetail({ id }: AlertDetailProps) {
  const alert = mockAlerts.find(a => a.id === id);
  if (!alert) return notFound();
  
  const product = mockProducts.find(p => p.id === alert.productId);
  if (!product) return notFound();

  // Progress Bar Logic
  let progressPercent = 0;
  let progressColorClass = styles.progressGreen;
  
  if (alert.type === 'low_stock') {
    // Current stock vs Threshold
    progressPercent = Math.min((alert.currentValue / alert.threshold) * 100, 100);
    if (alert.currentValue === 0) {
      progressColorClass = styles.progressRed;
    } else if (alert.currentValue <= alert.threshold / 2) {
      progressColorClass = styles.progressYellow;
    }
  } else {
    // Expiration: days remaining vs 30 as an arbitrary "max" for the bar
    const maxDays = 30;
    progressPercent = Math.max(0, Math.min((alert.currentValue / maxDays) * 100, 100));
    if (alert.currentValue <= 7) {
      progressColorClass = styles.progressRed;
    } else if (alert.currentValue <= 15) {
      progressColorClass = styles.progressOrange;
    } else {
      progressColorClass = styles.progressYellow;
    }
  }

  // Type Icon and Color
  const isExp = alert.type === 'expiration';
  const IconComponent = isExp ? Calendar : Package;
  const typeColorStyle = isExp ? styles.cardOrange : styles.cardRed;
  const badgeTitle = isExp ? 'Vencimiento' : 'Stock bajo';

  const dCreated = new Date(alert.createdAt);
  const formattedCreation = `${dCreated.toLocaleDateString()} ${dCreated.getHours()}:${dCreated.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className={styles.container}>
      
      {/* ACTIVE WARNING BANNER */}
      {alert.status === 'active' && (
        <div className={clsx(styles.warningBanner, isExp ? styles.bannerOrange : styles.bannerRed)}>
          <div className={styles.bannerIcon}>
            {isExp ? <CalendarClock size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div className={styles.bannerContent}>
            <h4 className={styles.bannerTitle}>Acción requerida inmediata</h4>
            <p className={styles.bannerDesc}>
              {isExp 
                ? `Este producto vence en ${alert.currentValue} días. Considera moverlo o marcarlo como descontinuado.`
                : `Este producto tiene stock crítico. Considera registrar una entrada de inventario.`
              }
            </p>
          </div>
          {!isExp && (
            <Link href="/movements/new" className={styles.bannerAction}>
              <Button variant="secondary" className={styles.bannerBtn}>Registrar entrada</Button>
            </Link>
          )}
        </div>
      )}

      <div className={styles.grid}>
        
        {/* COLUMN 1: ALERT INFO */}
        <div className={styles.column}>
          <div className={styles.cardSection}>
            <h2 className={styles.sectionTitle}>Información de la alerta</h2>
            
            <div className={clsx(styles.typeHighlightInfo, typeColorStyle)}>
              <div className={styles.iconGiantBox}>
                <IconComponent size={32} />
              </div>
              <div className={styles.typeTextInfo}>
                <span className={styles.typeLabel}>Tipo de incidencia</span>
                <span className={styles.typeTitleValue}>{badgeTitle}</span>
              </div>
            </div>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Estado Actual</span>
                <span className={styles.infoVal}>
                  {alert.status === 'active' && <Badge variant="inactive">Activa</Badge>}
                  {alert.status === 'resolved' && <Badge variant="active">Resuelta</Badge>}
                  {alert.status === 'dismissed' && <Badge variant="default">Descartada</Badge>}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoKey}>Fecha de generación</span>
                <span className={styles.infoVal}>{formattedCreation}</span>
              </div>

              {alert.resolvedAt && (
                <>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Fecha de resolución</span>
                    <span className={styles.infoVal}>{new Date(alert.resolvedAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoKey}>Resuelto por</span>
                    <span className={styles.infoVal}>{alert.resolvedBy}</span>
                  </div>
                  {alert.resolutionNote && (
                    <div className={styles.infoRowNote}>
                      <span className={styles.infoKey}>Nota de resolución</span>
                      <p className={styles.infoValNote}>{alert.resolutionNote}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.thresholdVisualizer}>
              <div className={styles.visualizerHeader}>
                <span className={styles.visualizerLabel}>Severidad de la métrica</span>
                <span className={styles.visualizerValue}>
                  {alert.currentValue} de {alert.threshold} {isExp ? 'días' : 'unidades (min)'}
                </span>
              </div>
              <div className={styles.progressBarTrack}>
                <div 
                  className={clsx(styles.progressBarFill, progressColorClass)} 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* COLUMN 2: AFFECTED PRODUCT */}
        <div className={styles.column}>
          <div className={styles.cardSection}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitle}>Producto afectado</h2>
              <Link href={`/products/${product.id}`} className={styles.externalLink}>
                Ver producto <ExternalLink size={14} />
              </Link>
            </div>

            <div className={styles.productVisual}>
              <div className={styles.productImageWrapper}>
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <Package size={40} className={styles.placeholderImgSvg} />
                )}
              </div>
              <div className={styles.productMainDetails}>
                <h3 className={styles.productNameBig}>{product.name}</h3>
                <span className={styles.productSkuMono}>{product.sku}</span>
                <div className={styles.categoryBreadcrumb}>
                  {product.parentCategoryName && <span>{product.parentCategoryName} &gt; </span>}
                  <span className={styles.catSelected}>{product.categoryName}</span>
                </div>
              </div>
            </div>

            <div className={styles.productDataGrid}>
              <div className={styles.dataBox}>
                <span className={styles.dataLabel}>Ubicación / Pasillo</span>
                <span className={styles.dataValueLight}>{alert.locationId || 'Principal'}</span>
              </div>
              <div className={styles.dataBox}>
                <span className={styles.dataLabel}>Stock Actual</span>
                <span className={clsx(styles.dataValueBold, { [styles.textRed]: product.stock === 0 })}>
                  {product.stock} uds.
                </span>
              </div>
              <div className={styles.dataBox}>
                <span className={styles.dataLabel}>Mínimo Configurado</span>
                <span className={styles.dataValueLight}>{alert.threshold} uds.</span>
              </div>
              <div className={styles.dataBox}>
                <span className={styles.dataLabel}>Precio Base</span>
                <span className={styles.dataValueLight}>${product.price.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
