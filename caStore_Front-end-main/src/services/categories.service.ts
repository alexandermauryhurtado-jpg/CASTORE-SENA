import api from '../lib/api';
import type {
  Category,
  CategoryTreeItem,
  PaginatedCategories,
  GetCategoriesParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../features/categories/types/categories.types';

const BASE = '/categories';

function getData<T>(response: { data?: { data?: T } } | null): T | null {
  if (response?.data?.data !== undefined) return response.data.data as T;
  return null;
}

export const categoriesService = {
  /** GET /categories — listado paginado */
  async getCategories(params: GetCategoriesParams = {}): Promise<PaginatedCategories | null> {
    try {
      const { data } = await api.get<{ data: Category[]; pagination: PaginatedCategories['pagination'] }>(BASE, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          search: params.search ?? undefined,
          parentId: params.parentId === null ? 'null' : params.parentId,
          includeInactive: params.includeInactive ?? false,
        },
      });
      if (!data?.data) return null;
      return {
        data: data.data,
        pagination: data.pagination ?? {
          total: data.data.length,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
          from: data.data.length ? 1 : 0,
          to: data.data.length,
        },
      };
    } catch {
      return null;
    }
  },

  /** GET /categories/tree — árbol para vista y selectores */
  async getTree(): Promise<CategoryTreeItem[] | null> {
    try {
      const response = await api.get<{ data: CategoryTreeItem[] }>(`${BASE}/tree`);
      return getData<CategoryTreeItem[]>(response);
    } catch {
      return null;
    }
  },

  /** GET /categories/:id */
  async getById(id: string): Promise<Category | null> {
    try {
      const response = await api.get<{ data: Category }>(`${BASE}/${id}`);
      return getData<Category>(response);
    } catch {
      return null;
    }
  },

  /** POST /categories */
  async create(payload: CreateCategoryPayload): Promise<Category | null> {
    try {
      const body = {
        ...payload,
        skuPrefix: payload.skuPrefix.toUpperCase(),
      };
      const response = await api.post<{ data: Category }>(BASE, body);
      return getData<Category>(response);
    } catch {
      return null;
    }
  },

  /** PATCH /categories/:id */
  async update(id: string, payload: UpdateCategoryPayload): Promise<Category | null> {
    try {
      const body = payload.skuPrefix
        ? { ...payload, skuPrefix: payload.skuPrefix.toUpperCase() }
        : payload;
      const response = await api.patch<{ data: Category }>(`${BASE}/${id}`, body);
      return getData<Category>(response);
    } catch {
      return null;
    }
  },

  /** DELETE /categories/:id (soft delete en backend) */
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(`${BASE}/${id}`);
      return { success: true };
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      return { success: false, error: message ?? 'Error al eliminar la categoría' };
    }
  },

};
