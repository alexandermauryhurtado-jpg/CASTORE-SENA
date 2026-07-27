import { v4 as uuidv4 } from 'uuid';
import { CategoryRepository, CategoryWithParent, CategoryWithChildren } from './category.repository';
import { CreateCategoryDto, UpdateCategoryDto, GetCategoriesDto } from './category.schema';
import { PaginatedResult } from '../../shared/types';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { ConflictError } from '../../shared/exceptions/ConflictError';
import { BusinessError } from '../../shared/exceptions/BusinessError';

export class CategoryService {
  constructor(private repo: CategoryRepository) {}

  async getAll(filters: GetCategoriesDto): Promise<PaginatedResult<CategoryWithParent>> {
    const page = parseInt(String(filters.page)) || 1;
    const limit = parseInt(String(filters.limit)) || 10;

    const [data, total] = await Promise.all([
      this.repo.findAll(filters),
      this.repo.count(filters),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
      from: total === 0 ? 0 : (page - 1) * limit + 1,
      to: total === 0 ? 0 : Math.min(page * limit, total),
    };
  }

  async getById(id: string): Promise<CategoryWithParent> {
    const category = await this.repo.findById(id);
    if (!category) {
      throw new NotFoundError('Categoría');
    }
    return category;
  }

  async getTree(): Promise<CategoryWithChildren[]> {
    return this.repo.findTree();
  }

  async create(dto: CreateCategoryDto): Promise<CategoryWithParent> {
    // 1. Verificar skuPrefix único
    const existingSku = await this.repo.findBySkuPrefix(dto.skuPrefix.toUpperCase());
    if (existingSku) {
      throw new ConflictError('prefijo SKU');
    }

    // 2. Si viene parentId verificar que el padre existe
    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundError('Categoría padre');
      }

      // 3. Verificar que el padre NO tiene padre (máximo 2 niveles)
      if (parent.parentId) {
        throw new BusinessError('No se pueden crear más de 2 niveles de categorías');
      }
    }

    const id = uuidv4();
    await this.repo.create({
      ...dto,
      id,
      skuPrefix: dto.skuPrefix.toUpperCase()
    });

    return this.getById(id);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryWithParent> {
    const category = await this.getById(id);

    if (dto.skuPrefix) {
      const existingSku = await this.repo.findBySkuPrefix(dto.skuPrefix.toUpperCase());
      if (existingSku && existingSku.id !== id) {
        throw new ConflictError('prefijo SKU');
      }
    }

    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundError('Categoría padre');
      }

      if (parent.parentId) {
        throw new BusinessError('No se pueden crear más de 2 niveles de categorías');
      }
      
      // Prevent circular reference (though only 2 levels allowed, good to check)
      if (dto.parentId === id) {
        throw new BusinessError('Una categoría no puede ser su propio padre');
      }
    }

    await this.repo.update(id, {
      ...dto,
      skuPrefix: dto.skuPrefix ? dto.skuPrefix.toUpperCase() : undefined
    });

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);

    const productCount = await this.repo.countProducts(id);
    if (productCount > 0) {
      throw new BusinessError('Esta categoría tiene productos activos asociados. Cambia su estado a Descontinuado antes de desactivar la categoría.');
    }

    const childrenCount = await this.repo.countChildren(id);
    if (childrenCount > 0) {
      throw new BusinessError('Desactiva primero las subcategorías de esta categoría');
    }

    await this.repo.deactivate(id);
  }
}
