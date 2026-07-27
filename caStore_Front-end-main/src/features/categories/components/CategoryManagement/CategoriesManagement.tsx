'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  List,
  Plus,
  ChevronRight,
  Trash2,
  AlertCircle,
  FolderPlus,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import clsx from 'clsx';
import styles from './CategoriesManagement.module.css';
import type { Category, CategoryTreeItem } from '../../types/categories.types';
import { treeItemToCategory } from '../../types/categories.types';
import { CategorySummary } from './CategorySummary';
import { CategoryTree } from './CategoryTree';
import { CategoryDetailSheet } from './CategoryDetailSheet';
import { CategoryFormDrawer } from '../CategoryForm/CategoryFormDrawer';
import { DataTable } from '../../../../components/tables/DataTable';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { CategoryFormData } from '../../schemas/category.schema';
import {
  useCategoriesTree,
  useCategoriesList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';

function flattenTree(nodes: CategoryTreeItem[]): Category[] {
  const out: Category[] = [];
  nodes.forEach((n) => {
    out.push(treeItemToCategory(n));
    if (n.children?.length) out.push(...flattenTree(n.children));
  });
  return out;
}

function findNodeInTree(nodes: CategoryTreeItem[], id: string): CategoryTreeItem | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = n.children?.length ? findNodeInTree(n.children, id) : null;
    if (found) return found;
  }
  return null;
}

export function CategoriesManagement() {
  const { showToast } = useToast();
  const { tree, isLoading: treeLoading, refetch: refetchTree } = useCategoriesTree();
  const [listPage, setListPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');

  const { data: listData, pagination, isLoading: listLoading } = useCategoriesList({
    page: listPage,
    limit: 10,
    search: searchQuery || undefined,
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentForSub, setParentForSub] = useState<CategoryTreeItem | null>(null);
  const [deletingNode, setDeletingNode] = useState<CategoryTreeItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const flatCategories = useMemo(() => flattenTree(tree), [tree]);

  const handleOpenForm = (cat?: Category | CategoryTreeItem | null, parent?: CategoryTreeItem | null) => {
    setEditingCategory(cat ? ('children' in cat ? treeItemToCategory(cat) : cat) : null);
    setParentForSub(parent ?? null);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (node: CategoryTreeItem) => {
    setSelectedCategory(treeItemToCategory(node));
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (node: CategoryTreeItem) => {
    setDeletingNode(node);
    setIsDeleteModalOpen(true);
  };

  const hasChildrenOrProducts = (node: CategoryTreeItem) => {
    const childrenCount = node.children?.length ?? 0;
    return childrenCount > 0 || node.productCount > 0;
  };

  const handleConfirmDelete = async () => {
    if (!deletingNode) return;
    const result = await deleteMutation.mutateAsync(deletingNode.id);
    if (result.success) {
      showToast({ message: 'Categoría desactivada correctamente', type: 'success' });
      setIsDeleteModalOpen(false);
      setDeletingNode(null);
      refetchTree();
    } else {
      showToast({ message: result.error ?? 'Error al eliminar la categoría', type: 'error' });
    }
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      skuPrefix: data.skuPrefix,
      icon: data.icon,
      color: data.color,
      parentId: data.parentId || undefined,
    };
    if (editingCategory) {
      const updated = await updateMutation.mutateAsync({ id: editingCategory.id, payload });
      if (updated) {
        showToast({ message: 'Categoría actualizada', type: 'success' });
        setIsFormOpen(false);
        setEditingCategory(null);
        setParentForSub(null);
      } else {
        showToast({ message: 'Error al actualizar la categoría', type: 'error' });
      }
    } else {
      const created = await createMutation.mutateAsync(payload);
      if (created) {
        showToast({ message: 'Categoría creada con éxito', type: 'success' });
        setIsFormOpen(false);
        setEditingCategory(null);
        setParentForSub(null);
      } else {
        showToast({ message: 'Error al crear la categoría', type: 'error' });
      }
    }
  };

  const isLoading = viewMode === 'tree' ? treeLoading : listLoading;

  const flatColumns = [
    {
      key: 'name',
      header: 'Nombre',
      render: (c: Category) => (
        <div className={styles.flatNameCell}>
          <span className={styles.flatName}>{c.name}</span>
          {c.parentId && <span className={styles.flatType}>Subcategoría</span>}
          {!c.parentId && <span className={styles.flatTypeMain}>Principal</span>}
        </div>
      ),
    },
    {
      key: 'parent',
      header: 'Padre',
      render: (c: Category) => {
        const parent = flatCategories.find((p) => p.id === c.parentId);
        return parent ? parent.name : '-';
      },
    },
    {
      key: 'sku',
      header: 'Prefijo SKU',
      render: (c: Category) => <code className={styles.skuInline}>{c.skuPrefix}-</code>,
    },
    { key: 'productCount', header: 'Productos' },
    {
      key: 'createdAt',
      header: 'Creación',
      render: (c: Category) => (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (c: Category) => {
        const node = findNodeInTree(tree, c.id) ?? { ...c, children: [] };
        return (
          <div className={styles.flatActions}>
            <button type="button" className={styles.iconBtn} onClick={() => handleOpenForm(c)}>
              <Plus size={16} />
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => handleDeleteClick(node as CategoryTreeItem)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <CategorySummary categories={flatCategories} />

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Input
            placeholder="Buscar categoría o subcategoría..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (viewMode === 'flat') setListPage(1);
            }}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={clsx(styles.toggleBtn, { [styles.toggleActive]: viewMode === 'tree' })}
              onClick={() => setViewMode('tree')}
              title="Vista de Árbol"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              className={clsx(styles.toggleBtn, { [styles.toggleActive]: viewMode === 'flat' })}
              onClick={() => setViewMode('flat')}
              title="Vista de Lista"
            >
              <List size={18} />
            </button>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <FolderPlus size={18} style={{ marginRight: '8px' }} />
            Nueva categoría
          </Button>
        </div>
      </div>

      <div className={styles.viewContainer}>
        {viewMode === 'tree' ? (
          <CategoryTree
            tree={tree}
            searchQuery={searchQuery}
            onEdit={(node) => handleOpenForm(node)}
            onDelete={handleDeleteClick}
            onAddSub={(parent) => handleOpenForm(null, parent)}
            onSelect={handleOpenDetail}
          />
        ) : (
          <>
            <DataTable data={listData} columns={flatColumns} />
            {pagination && (pagination.totalPages > 1 || listPage > 1) && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </Button>
                <span className={styles.paginationInfo}>
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
                </span>
                <Button
                  variant="secondary"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setListPage((p) => p + 1)}
                >
                  Siguiente
                  <ChevronRightIcon size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <CategoryDetailSheet
        category={selectedCategory}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(cat) => {
          setIsDetailOpen(false);
          handleOpenForm(cat);
        }}
        onDelete={(cat) => {
          setIsDetailOpen(false);
          handleDeleteClick({ ...cat, children: [] } as CategoryTreeItem);
        }}
      />

      <CategoryFormDrawer
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCategory(null);
          setParentForSub(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        parentCategory={parentForSub ? treeItemToCategory(parentForSub) : null}
        treeFlat={flatCategories}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={
          deletingNode && hasChildrenOrProducts(deletingNode)
            ? 'No se puede eliminar'
            : 'Eliminar categoría'
        }
        footer={
          deletingNode && hasChildrenOrProducts(deletingNode) ? (
            <Button onClick={() => setIsDeleteModalOpen(false)}>Entendido</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                Confirmar eliminación
              </Button>
            </>
          )
        }
      >
        {deletingNode && (
          <div className={styles.deleteModalBody}>
            {hasChildrenOrProducts(deletingNode) ? (
              <div className={styles.blockingError}>
                <div className={styles.errorIconBox}>
                  <AlertCircle size={32} />
                </div>
                <p className={styles.errorMsg}>
                  No es posible eliminar esta categoría. Primero reasigna o elimina los elementos
                  asociados.
                </p>
                <div className={styles.associatedList}>
                  <div className={styles.assocItem}>
                    <strong>{deletingNode.children?.length ?? 0}</strong> Subcategorías
                  </div>
                  <div className={styles.assocItem}>
                    <strong>{deletingNode.productCount}</strong> Productos
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.confirmMsg}>
                ¿Estás seguro que deseas desactivar la categoría <strong>{deletingNode.name}</strong>?
                (Soft delete según API).
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
