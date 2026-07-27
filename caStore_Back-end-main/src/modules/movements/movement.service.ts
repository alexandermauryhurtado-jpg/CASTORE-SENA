import { v4 as uuidv4 } from 'uuid';
import { MovementRepository, MovementWithDetails, KardexItem, DailySummaryItem } from './movement.repository';
import { ProductRepository } from '../products/product.repository';
import { AlertService } from '../alerts/alert.service';
import { CreateMovementDto, GetMovementsDto, KardexDto } from './movement.schema';
import { PaginatedResult } from '../../shared/types';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { BusinessError } from '../../shared/exceptions/BusinessError';
import { getConnection } from '../../config/database';

export class MovementService {
  constructor(
    private repo: MovementRepository = new MovementRepository(),
    private productRepo: ProductRepository = new ProductRepository(),
    private alertService: AlertService = new AlertService()
  ) {}

  async getAll(filters: GetMovementsDto): Promise<PaginatedResult<MovementWithDetails>> {
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

  async getById(id: string): Promise<MovementWithDetails> {
    const movement = await this.repo.findById(id);
    if (!movement) {
      throw new NotFoundError('Movimiento');
    }
    return movement;
  }

  async register(dto: CreateMovementDto, userId: string): Promise<MovementWithDetails> {
    const conn = await getConnection();
    
    try {
      await conn.beginTransaction();

      // 1. Buscar producto
      // Nota: Usamos el repo del producto pero con un método que debería soportar transacciones
      // o simplemente confiar en que el repo usa el pool y manejamos la tx aquí.
      // Sin embargo, para seguridad total, las operaciones de escritura deben ser atómicas.
      
      const product = await this.productRepo.findById(dto.productId);
      if (!product) {
        throw new NotFoundError('Producto');
      }

      if (product.status !== 'ACTIVE') {
        throw new BusinessError('No se pueden registrar movimientos en productos inactivos o descontinuados');
      }

      // 2. Calcular stock
      const stockBefore = product.currentStock;
      let stockAfter = stockBefore;

      switch (dto.type) {
        case 'PURCHASE_ENTRY':
        case 'POSITIVE_ADJUSTMENT':
        case 'RETURN':
          stockAfter = stockBefore + dto.quantity;
          break;
        case 'SALE_EXIT':
        case 'NEGATIVE_ADJUSTMENT':
          stockAfter = stockBefore - dto.quantity;
          break;
        case 'TRANSFER':
          stockAfter = stockBefore; // No cambia stock total
          break;
      }

      // 3. Validar stock negativo
      if (stockAfter < 0) {
        throw new BusinessError(`Stock insuficiente. Stock actual: ${stockBefore} unidades. Cantidad solicitada: ${dto.quantity} unidades.`);
      }

      // 4. Calcular costo total
      const totalCost = (dto.unitCost && dto.quantity) ? dto.unitCost * dto.quantity : null;

      // 5. Generar ID y registrar
      const id = uuidv4();
      await this.repo.create({
        ...dto,
        id,
        stockBefore,
        stockAfter,
        totalCost,
        userId,
        lotNumber: dto.lotNumber || null,
        docReference: dto.docReference || null,
        notes: dto.notes || null,
        unitCost: dto.unitCost || null,
        supplierId: dto.supplierId || null,
        fromLocationId: dto.fromLocationId || null,
        toLocationId: dto.toLocationId || null,
      });

      // 6. Actualizar stock del producto
      await this.productRepo.updateStock(product.id, stockAfter);

      // 7. Si es una transferencia, actualizar ubicación si se especifica toLocationId
      // El requerimiento dice que en TRANSFER toLocationId es requerido por Zod.
      if (dto.type === 'TRANSFER' && dto.toLocationId) {
        await this.productRepo.update(product.id, { locationId: dto.toLocationId });
      } else if (dto.type === 'PURCHASE_ENTRY' && dto.toLocationId) {
        // En entrada por compra también actualizamos ubicación si viene
        await this.productRepo.update(product.id, { locationId: dto.toLocationId });
      } else if (dto.type === 'RETURN' && dto.toLocationId) {
        // En devolución también actualizamos ubicación si viene
        await this.productRepo.update(product.id, { locationId: dto.toLocationId });
      }

      await conn.commit();

      // Generar alertas (fuera de la transacción para no bloquear)
      await this.alertService.generateStockAlert(dto.productId);

      return this.getById(id);

    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  async getKardex(filters: KardexDto): Promise<any> {
    const product = await this.productRepo.findById(filters.productId);
    if (!product) {
      throw new NotFoundError('Producto');
    }
    return this.repo.getKardex(filters);
  }

  async getDailySummary(days: number = 7): Promise<DailySummaryItem[]> {
    return this.repo.getDailySummary(days);
  }

  async getTodaySummary() {
    return this.repo.getTodaySummary();
  }
}
