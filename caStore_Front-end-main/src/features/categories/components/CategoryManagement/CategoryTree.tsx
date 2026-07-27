import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import styles from './CategoryTree.module.css';
import type { CategoryTreeItem } from '../../types/categories.types';
import { Badge } from '../../../../components/ui/Badge';

interface CategoryNodeProps {
  node: CategoryTreeItem;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (node: CategoryTreeItem) => void;
  onDelete: (node: CategoryTreeItem) => void;
  onAddSub: (node: CategoryTreeItem) => void;
  onSelect: (node: CategoryTreeItem) => void;
  level?: number;
  highlighted?: boolean;
  dimmed?: boolean;
}

export function CategoryNode({
  node,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddSub,
  onSelect,
  level = 0,
  highlighted = false,
  dimmed = false,
}: CategoryNodeProps) {
  const children = node.children ?? [];
  const hasSubcategories = children.length > 0;
  const isSubcategory = !!node.parentId;

  return (
    <div className={clsx(styles.nodeWrapper, { [styles.dimmed]: dimmed })}>
      <div
        className={clsx(styles.node, {
          [styles.mainNode]: !isSubcategory,
          [styles.subNode]: isSubcategory,
          [styles.selected]: highlighted,
        })}
        onClick={() => onSelect(node)}
      >
        <div className={styles.nodeLeft}>
          {hasSubcategories ? (
            <button
              className={styles.chevron}
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : (
            <div className={styles.chevronPlaceholder} />
          )}

          <div className={clsx(styles.iconBox, { [styles.iconSub]: isSubcategory })}>
            {isExpanded ? <FolderOpen size={18} /> : <Folder size={18} />}
          </div>

          <div className={styles.nameSection}>
            <span className={styles.name}>{node.name}</span>
            <div className={styles.badges}>
              {!isSubcategory && (
                <Badge variant="default" className={styles.smallBadge}>
                  {children.length} sub.
                </Badge>
              )}
              <Badge variant="inactive" className={styles.tinyBadge}>
                {node.productCount} prod.
              </Badge>
            </div>
          </div>
        </div>

        <div className={styles.nodeRight}>
          <div className={styles.skuPrefix}>
            <span className={styles.skuLabel}>SKU prefix:</span>
            <code className={styles.skuValue}>{node.skuPrefix}-</code>
          </div>

          <div className={styles.actions}>
            {!isSubcategory && (
              <button
                className={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSub(node);
                }}
                title="Agregar subcategoría"
              >
                <Plus size={16} />
              </button>
            )}
            <button
              className={styles.actionBtn}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(node);
              }}
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              className={clsx(styles.actionBtn, styles.deleteAction)}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node);
              }}
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {hasSubcategories && isExpanded && (
        <div className={styles.children}>
          <div className={styles.connectorLine} />
          {children.map((sub) => (
            <CategoryNode
              key={sub.id}
              node={sub}
              isExpanded={false}
              onToggle={() => {}}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
              onSelect={onSelect}
              level={level + 1}
              dimmed={dimmed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryTreeProps {
  tree: CategoryTreeItem[];
  searchQuery: string;
  onEdit: (node: CategoryTreeItem) => void;
  onDelete: (node: CategoryTreeItem) => void;
  onAddSub: (node: CategoryTreeItem) => void;
  onSelect: (node: CategoryTreeItem) => void;
}

export function CategoryTree({
  tree,
  searchQuery,
  onEdit,
  onDelete,
  onAddSub,
  onSelect,
}: CategoryTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isSearching = searchQuery.length > 0;

  const matchesQuery = (n: CategoryTreeItem) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.skuPrefix.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className={styles.treeContainer}>
      {tree.map((node) => {
        const children = node.children ?? [];
        const catMatches = matchesQuery(node);
        const subMatches = children.some(matchesQuery);
        const highlighted = isSearching && catMatches;
        const dimmed = isSearching && !catMatches && !subMatches;
        const isForceExpanded = isSearching && subMatches;
        const expanded = expandedNodes[node.id] ?? isForceExpanded;

        return (
          <CategoryNode
            key={node.id}
            node={node}
            isExpanded={expanded}
            onToggle={() => toggleNode(node.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSub={onAddSub}
            onSelect={onSelect}
            highlighted={highlighted}
            dimmed={dimmed}
          />
        );
      })}
    </div>
  );
}
