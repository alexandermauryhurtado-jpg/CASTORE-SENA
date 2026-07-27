/** Categoría plana (listado y detalle) — alineado con backend CategoryWithParent */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  skuPrefix: string;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  parentName: string | null;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

/** Nodo del árbol — alineado con backend CategoryWithChildren */
export interface CategoryTreeItem {
  id: string;
  name: string;
  description: string | null;
  skuPrefix: string;
  icon: string | null;
  color: string | null;
  parentId: string | null;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
  children: CategoryTreeItem[];
}

/** Respuesta paginada del backend */
export interface PaginatedCategories {
  data: Category[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    from: number;
    to: number;
  };
}

/** Parámetros para GET /categories */
export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  includeInactive?: boolean;
}

/** Payload creación/actualización */
export interface CreateCategoryPayload {
  name: string;
  description?: string;
  skuPrefix: string;
  icon?: string;
  color?: string;
  parentId?: string;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

/** Convierte un nodo del árbol a categoría plana (para detalle/formulario). */
export function treeItemToCategory(node: CategoryTreeItem): Category {
  return {
    id: node.id,
    name: node.name,
    description: node.description,
    skuPrefix: node.skuPrefix,
    icon: node.icon,
    color: node.color,
    parentId: node.parentId,
    parentName: null,
    productCount: node.productCount,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  };
}
