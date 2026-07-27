import { v4 as uuidv4 } from 'uuid';
import { ProductRepository, ProductWithDetails, ProductStats } from './product.repository';
import { CategoryRepository } from '../categories/category.repository';
import { LocationRepository } from '../locations/location.repository';
import { query } from '../../config/database';
import { 
  CreateProductDto, 
  UpdateProductDto, 
  GetProductsDto, 
  UpdateStatusDto 
} from './product.schema';
import { PaginatedResult } from '../../shared/types';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { BusinessError } from '../../shared/exceptions/BusinessError';

export class ProductService {
  constructor(
    private repo: ProductRepository,
    private categoryRepo: CategoryRepository = new CategoryRepository(),
    private locationRepo: LocationRepository = new LocationRepository()
  ) {}

  async getAll(filters: GetProductsDto): Promise<PaginatedResult<ProductWithDetails>> {
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

  async getById(id: string): Promise<ProductWithDetails> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new NotFoundError('Producto');
    }
    return product;
  }

  async create(dto: CreateProductDto, userId: string): Promise<ProductWithDetails> {
    // 1. Verificar categoría
    const category = await this.categoryRepo.findById(dto.categoryId);
    if (!category) {
      throw new NotFoundError('Categoría');
    }

    // 2. Verificar que la categoría está activa
    // Nota: Aunque findById ya filtra por is_active = 1, es bueno ser explícito en el error
    // si el repo permitiera ver todas. Actualmente el repo de categorías ya filtra.
    
    // 3. Si viene locationId verificar existencia y estado
    if (dto.locationId) {
      const location = await this.locationRepo.findById(dto.locationId);
      if (!location) {
        throw new NotFoundError('Ubicación');
      }
    }

    // 4. Generar SKU
    const sequence = await this.repo.getNextSkuSequence(dto.categoryId);
    const sku = `${category.skuPrefix}-${String(sequence).padStart(5, '0')}`;

    // 5. Generar ID
    const id = uuidv4();

    // 6. repo.create
    await this.repo.create({
      ...dto,
      id,
      sku,
      description: dto.description || null,
      locationId: dto.locationId || null,
      expiryDate: dto.expiryDate || null,
      currentStock: dto.currentStock,
    });

    // 7. Si hay stock inicial, registrar movimiento
    if (dto.currentStock > 0) {
      const movementId = uuidv4();
      const movementSql = `
        INSERT INTO movements 
        (id, type, quantity, stock_before, stock_after, doc_reference, product_id, user_id, created_at)
        VALUES (?, 'POSITIVE_ADJUSTMENT', ?, 0, ?, 'STOCK_INICIAL', ?, ?, NOW())
      `;
      // Usamos query directo ya que el módulo movements no está disponible
      await query(movementSql, [movementId, dto.currentStock, dto.currentStock, id, userId]);
    }

    return this.getById(id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductWithDetails> {
    await this.getById(id);

    if (dto.categoryId) {
      const category = await this.categoryRepo.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundError('Categoría');
      }
    }

    if (dto.locationId) {
      const location = await this.locationRepo.findById(dto.locationId);
      if (!location) {
        throw new NotFoundError('Ubicación');
      }
    }

    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<ProductWithDetails> {
    await this.getById(id);
    await this.repo.updateStatus(id, dto.status);
    return this.getById(id);
  }

  async uploadImage(id: string, imageUrl: string): Promise<ProductWithDetails> {
    await this.getById(id);
    await this.repo.updateImageUrl(id, imageUrl);
    return this.getById(id);
  }

  async getStats(): Promise<ProductStats> {
    return this.repo.getDashboardStats();
  }
}
