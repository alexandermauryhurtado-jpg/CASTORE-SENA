import React from 'react';
import { X, Calendar, Package, Info, History } from 'lucide-react';
import clsx from 'clsx';
import styles from './CategoryDetailSheet.module.css';
import { Category } from '../../mockData';
import { Button } from '../../../../components/ui/Button';

interface CategoryDetailSheetProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

export function CategoryDetailSheet({ 
  category, 
  isOpen, 
  onClose,
  onEdit,
  onDelete
}: CategoryDetailSheetProps) {
  if (!category) return null;

  const dCreated = new Date(category.createdAt);

  return (
    <>
      <div 
        className={clsx(styles.overlay, { [styles.overlayOpen]: isOpen })} 
        onClick={onClose} 
      />
      <div className={clsx(styles.sheet, { [styles.sheetOpen]: isOpen })}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h2 className={styles.title}>Detalle de Categoría</h2>
            <span className={styles.subtitle}>{category.parentId ? 'Subcategoría' : 'Categoría Principal'}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.mainInfo}>
            <div className={styles.infoTop}>
               <h3 className={styles.catName}>{category.name}</h3>
               <div className={styles.skuBadge}>
                 <span className={styles.skuLabel}>Prefijo SKU:</span>
                 <code>{category.skuPrefix}-</code>
               </div>
            </div>
            {category.description && (
              <p className={styles.description}>{category.description}</p>
            )}
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Productos asociados</span>
              <div className={styles.statValueRow}>
                <Package size={20} className={styles.statIcon} />
                <span className={styles.statValue}>{category.productCount}</span>
              </div>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Fecha de creación</span>
              <div className={styles.statValueRow}>
                <Calendar size={20} className={styles.statIcon} />
                <span className={styles.statValue}>{dCreated.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <History size={18} />
              <h4>Últimos productos asociados</h4>
            </div>
            <div className={styles.productsList}>
              {/* Mock list of 3 products */}
              {[1, 2, 3].map(i => (
                <div key={i} className={styles.productItem}>
                   <div className={styles.pInfo}>
                     <span className={styles.pName}>Producto Ejemplo {i}</span>
                     <span className={styles.pSku}>SKU: {category.skuPrefix}-00{i}</span>
                   </div>
                   <div className={styles.pStock}>Stock: {Math.floor(Math.random() * 20)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button 
            variant="secondary" 
            className={styles.footerBtn}
            onClick={() => onEdit(category)}
          >
            Editar categoría
          </Button>
          <Button 
            variant="danger" 
            className={styles.footerBtn}
            onClick={() => onDelete(category)}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </>
  );
}
