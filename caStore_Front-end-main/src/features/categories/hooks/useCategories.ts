'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { categoriesService } from '@/src/services/categories.service';
import type {
  Category,
  CategoryTreeItem,
  GetCategoriesParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  PaginatedCategories,
} from '../types/categories.types';

const CATEGORIES_KEY = 'categories';
const TREE_KEY = [CATEGORIES_KEY, 'tree'] as const;
const LIST_KEY = [CATEGORIES_KEY, 'list'] as const;
const DETAIL_KEY = [CATEGORIES_KEY, 'detail'] as const;


/** Árbol de categorías (GET /categories/tree). Fallback a mock si falla la API. */
export function useCategoriesTree() {
  const query = useQuery({
    queryKey: TREE_KEY,
    queryFn: async (): Promise<CategoryTreeItem[]> => {
      const data = await categoriesService.getTree();
      return data ?? [];
    },
    initialData: [],
  });

  return {
    tree: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

/** Listado paginado (GET /categories). Fallback a mock. */
export function useCategoriesList(params: GetCategoriesParams = {}) {
  const { page = 1, limit = 10, search } = params;
  const query = useQuery({
    queryKey: [...LIST_KEY, page, limit, search ?? ''],
    queryFn: async (): Promise<PaginatedCategories> => {
      const result = await categoriesService.getCategories(params);
      if (result) return result;
      return {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
          from: 0,
          to: 0,
        },
      };
    },
  });
  
  return {
    data: query.data?.data ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

/** Una categoría por ID (GET /categories/:id). */
export function useCategoryById(id: string | null) {
  const query = useQuery({
    queryKey: [...DETAIL_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      return categoriesService.getById(id);
    },
    enabled: !!id,
  });
  return {
    category: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

/** Crear categoría. Invalida cache tras éxito. */
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

/** Actualizar categoría. Invalida cache tras éxito. */
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoriesService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

/** Eliminar categoría (soft delete). Invalida cache tras éxito. */
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
    },
  });
}

/** Hook legacy: árbol como lista plana para compatibilidad con página que espera categories + isLoading + etc. */
export function useCategories() {
  const { tree, isLoading, error, refetch } = useCategoriesTree();
  
  const getFlatCategories = useCallback((nodes: CategoryTreeItem[]): Category[] => {
    const out: Category[] = [];
    const walk = (items: CategoryTreeItem[]) => {
      items.forEach((n) => {
        out.push({
          id: n.id,
          name: n.name,
          description: n.description,
          skuPrefix: n.skuPrefix,
          icon: n.icon,
          color: n.color,
          parentId: n.parentId,
          parentName: null,
          productCount: n.productCount,
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
        });
        if (n.children?.length) walk(n.children);
      });
    };
    walk(nodes);
    return out;
  }, []);

  const categories = getFlatCategories(tree);
  return {
    categories,
    tree,
    isLoading,
    error,
    refresh: refetch,
    isEmpty: categories.length === 0,
  };
}
