import { v4 as uuidv4 } from 'uuid';
import { SupplierRepository, SupplierWithStats, PurchaseHistoryItem } from './supplier.repository';
import { CreateSupplierDto, UpdateSupplierDto, GetSuppliersDto } from './supplier.schema';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { ConflictError } from '../../shared/exceptions/ConflictError';
import { BusinessError } from '../../shared/exceptions/BusinessError';

export interface PaginatedResult<T> {
  data: T[];
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
}

export class SupplierService {
  constructor(private repo: SupplierRepository) {}

  async getAll(filters: GetSuppliersDto): Promise<PaginatedResult<SupplierWithStats>> {
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

  async getById(id: string): Promise<SupplierWithStats> {
    const supplier = await this.repo.findById(id);
    if (!supplier) {
      throw new NotFoundError('Proveedor');
    }
    return supplier;
  }

  async create(dto: CreateSupplierDto): Promise<SupplierWithStats> {
    const existing = await this.repo.findByTaxId(dto.taxId);
    if (existing) {
      throw new ConflictError('Ya existe un proveedor con este NIT/RUC');
    }

    const id = uuidv4();
    await this.repo.create({ ...dto, id });

    return this.getById(id);
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<SupplierWithStats> {
    await this.getById(id); // Verificar existencia

    if (dto.taxId) {
      const existing = await this.repo.findByTaxId(dto.taxId);
      if (existing && existing.id !== id) {
        throw new ConflictError('Ya existe otro proveedor con este NIT/RUC');
      }
    }

    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id); // Verificar existencia
    await this.repo.deactivate(id);
  }

  async getPurchaseHistory(
    supplierId: string, 
    filters: { page: number; limit: number; dateFrom?: string; dateTo?: string; search?: string }
  ): Promise<PaginatedResult<PurchaseHistoryItem>> {
    await this.getById(supplierId); // Verificar existencia

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const { data, total } = await this.repo.getPurchaseHistory(supplierId, filters);

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
}
