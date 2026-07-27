import React from 'react';
import { Folder, FolderOpen, Box } from 'lucide-react';
import styles from './CategorySummary.module.css';
import { Category } from '../../mockData';

interface CategorySummaryProps {
  categories: Category[];
}

export function CategorySummary({ categories }: CategorySummaryProps) {
  const mainCategoriesCount = categories.filter(c => !c.parentId).length;
  const subCategoriesCount = categories.filter(c => c.parentId).length;
  const totalProducts = categories.reduce((acc, curr) => acc + curr.productCount, 0);

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.iconWrapperOrange}>
          <Folder size={24} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Categorías principales</span>
          <span className={styles.value}>{mainCategoriesCount}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrapperBlue}>
          <FolderOpen size={24} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Subcategorías</span>
          <span className={styles.value}>{subCategoriesCount}</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrapperGreen}>
          <Box size={24} />
        </div>
        <div className={styles.content}>
          <span className={styles.label}>Productos clasificados</span>
          <span className={styles.value}>{totalProducts}</span>
        </div>
      </div>
    </div>
  );
}
