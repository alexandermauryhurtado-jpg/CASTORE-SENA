import { v4 as uuidv4 } from 'uuid';
import { AlertRepository, AlertWithDetails, AlertSummary } from './alert.repository';
import { ProductRepository } from '../products/product.repository';
import { GetAlertsDto, ResolveAlertDto, DismissAlertDto } from './alert.schema';
import { PaginatedResult } from '../../shared/types';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { BusinessError } from '../../shared/exceptions/BusinessError';

export class AlertService {
  constructor(
    private repo: AlertRepository = new AlertRepository(),
    private productRepo: ProductRepository = new ProductRepository()
  ) {}

  async getAll(filters: GetAlertsDto): Promise<PaginatedResult<AlertWithDetails>> {
    const [data, total] = await Promise.all([
      this.repo.findAll(filters),
      this.repo.count(filters),
    ]);

    const page = filters.page;
    const limit = filters.limit;
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

  async getById(id: string): Promise<AlertWithDetails> {
    const alert = await this.repo.findById(id);
    if (!alert) {
      throw new NotFoundError('Alerta');
    }
    return alert;
  }

  async getSummary(): Promise<AlertSummary> {
    return this.repo.getSummary();
  }

  async resolve(id: string, userId: string, dto: ResolveAlertDto): Promise<AlertWithDetails> {
    const alert = await this.getById(id);
    if (alert.status !== 'ACTIVE') {
      throw new BusinessError('Solo se pueden resolver alertas activas');
    }

    await this.repo.resolve(id, userId, dto.notes);
    return this.getById(id);
  }

  async dismiss(id: string, userId: string, dto: DismissAlertDto): Promise<AlertWithDetails> {
    const alert = await this.getById(id);
    if (alert.status !== 'ACTIVE') {
      throw new BusinessError('Solo se pueden descartar alertas activas');
    }

    await this.repo.dismiss(id, userId, dto.notes);
    return this.getById(id);
  }

  async generateStockAlert(productId: string): Promise<void> {
    try {
      const product = await this.productRepo.findById(productId);
      if (!product || product.status !== 'ACTIVE') return;

      // 1. Verificar LOW_STOCK
      if (product.currentStock <= product.minStock) {
        const existing = await this.repo.findActiveByProduct(productId, 'LOW_STOCK');
        if (!existing) {
          await this.repo.create({
            id: uuidv4(),
            type: 'LOW_STOCK',
            productId,
            threshold: product.minStock,
            currentValue: product.currentStock,
            notes: `Stock actual (${product.currentStock}) es menor o igual al mínimo (${product.minStock})`
          });
        }
      } else {
        // Resolver automáticamente si el stock subió del mínimo
        await this.repo.resolveByProduct(productId, 'LOW_STOCK');
      }

      // 2. Verificar Expiración si aplica
      if (product.hasExpiry && product.expiryDate) {
        const now = new Date();
        const expiryDate = new Date(product.expiryDate);
        const diffTime = expiryDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let alertType: string | null = null;
        if (diffDays <= 7 && diffDays > 0) alertType = 'EXPIRY_7D';
        else if (diffDays <= 15 && diffDays > 7) alertType = 'EXPIRY_15D';
        else if (diffDays <= 30 && diffDays > 15) alertType = 'EXPIRY_30D';

        if (alertType) {
          const existing = await this.repo.findActiveByProduct(productId, alertType);
          if (!existing) {
            await this.repo.create({
              id: uuidv4(),
              type: alertType,
              productId,
              threshold: 0, // No aplica para vencimiento así que usamos 0
              currentValue: diffDays, // Usamos currentValue para guardar los días restantes
              notes: `El producto vence en ${diffDays} días (${expiryDate.toLocaleDateString()})`
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error generando alertas para producto ${productId}:`, error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  }

  async generateExpiryAlerts(): Promise<void> {
    try {
      // Este método simula un cron job buscando todos los productos activos con vencimiento
      // Nota: No tenemos un findAll total en ProductRepository que devuelva todo lo que necesitamos
      // Usamos GetProductsDto para traer una cantidad considerable o filtramos por categorías.
      // Por ahora, asumimos que procesamos los que están activos.
      
      // NOTA: Para producción esto debería ser una query específica en ProductRepository
      const filters = { lowStock: false, status: 'ACTIVE' as const, page: 1, limit: 1000 };
      const products = await this.productRepo.findAll(filters);
      
      let count = 0;
      for (const product of products) {
        if (product.hasExpiry && product.expiryDate) {
          await this.generateStockAlert(product.id);
          count++;
        }
      }
      console.log(`Evaluación de vencimiento completada. Productos procesados: ${count}`);
    } catch (error) {
      console.error('Error en proceso masivo de alertas de vencimiento:', error);
    }
  }
}
