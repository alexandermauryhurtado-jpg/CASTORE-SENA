import { v4 as uuidv4 } from 'uuid';
import { LocationRepository, LocationWithDetails, LocationTree } from './location.repository';
import { CreateLocationDto, UpdateLocationDto, GetLocationsDto } from './location.schema';
import { PaginatedResult } from '../../shared/types';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { ConflictError } from '../../shared/exceptions/ConflictError';
import { BusinessError } from '../../shared/exceptions/BusinessError';

export class LocationService {
  constructor(private repo: LocationRepository) {}

  async getAll(filters: GetLocationsDto): Promise<PaginatedResult<LocationWithDetails>> {
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

  async getById(id: string): Promise<LocationWithDetails> {
    const location = await this.repo.findById(id);
    if (!location) {
      throw new NotFoundError('Localización');
    }
    return location;
  }

  async getTree(): Promise<LocationTree[]> {
    return this.repo.findTree();
  }

  async create(dto: CreateLocationDto): Promise<LocationWithDetails> {
    // 1. Verificar code único
    const existing = await this.repo.findByCode(dto.code);
    if (existing) {
      throw new ConflictError('código de ubicación');
    }

    // 2. Si type !== WAREHOUSE y no viene parentId
    if (dto.type !== 'WAREHOUSE' && !dto.parentId) {
      throw new BusinessError('La ubicación padre es requerida para este tipo');
    }

    // 3. Si viene parentId
    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundError('Ubicación padre');
      }

      const isValidHierarchy = await this.repo.validateHierarchy(dto.parentId, dto.type);
      if (!isValidHierarchy) {
        let expectedParent = '';
        switch (dto.type) {
          case 'ZONE': expectedParent = 'WAREHOUSE'; break;
          case 'AISLE': expectedParent = 'ZONE'; break;
          case 'SHELF': expectedParent = 'AISLE'; break;
          case 'CELL': expectedParent = 'SHELF'; break;
        }
        throw new BusinessError(`Una ${dto.type} debe pertenecer a un ${expectedParent}`);
      }
    }

    const id = uuidv4();
    await this.repo.create({ ...dto, id });

    return this.getById(id);
  }

  async update(id: string, dto: UpdateLocationDto): Promise<LocationWithDetails> {
    await this.getById(id);
    // Note: code and type are inmutable per rules
    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);

    const productCount = await this.repo.countProducts(id);
    if (productCount > 0) {
      throw new BusinessError('Reasigna los productos antes de desactivar esta ubicación');
    }

    const childCount = await this.repo.countChildren(id);
    if (childCount > 0) {
      throw new BusinessError('Desactiva primero las ubicaciones que contiene');
    }

    await this.repo.deactivate(id);
  }
}
