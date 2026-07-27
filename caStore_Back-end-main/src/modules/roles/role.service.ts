import { v4 as uuidv4 } from 'uuid';
import { RoleRepository, RoleWithUserCount } from './role.repository';
import { CreateRoleDto, UpdateRoleDto, GetRolesDto } from './role.schema';
import { Role, PaginatedResult } from '../../shared/types';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { BusinessError } from '../../shared/exceptions/BusinessError';
import { ForbiddenError } from '../../shared/exceptions/ForbiddenError';

export class RoleService {
  constructor(private repo: RoleRepository) {}

  async getAll(filters: GetRolesDto): Promise<PaginatedResult<RoleWithUserCount>> {
    const page = parseInt(String(filters.page)) || 1;
    const limit = parseInt(String(filters.limit)) || 10;

    const [data, total] = await Promise.all([
      this.repo.findWithUserCount(filters),
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

  async getById(id: string): Promise<Role> {
    const role = await this.repo.findById(id);
    if (!role) {
      throw new NotFoundError('Rol');
    }
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new BusinessError('Ya existe un rol con ese nombre');
    }

    const id = uuidv4();
    await this.repo.create({ ...dto, id });
    return this.getById(id);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.getById(id);

    if (role.isSystem) {
      throw new ForbiddenError('Los roles del sistema no pueden modificarse');
    }

    if (dto.name) {
      const existing = await this.repo.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new BusinessError('Ya existe otro rol con ese nombre');
      }
    }

    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const role = await this.getById(id);

    if (role.isSystem) {
      throw new ForbiddenError('Los roles del sistema no pueden eliminarse');
    }

    const userCount = await this.repo.countUsersWithRole(id);
    if (userCount > 0) {
      throw new BusinessError('Este rol tiene usuarios activos asociados. Reasigna a los usuarios antes de desactivar el rol.');
    }

    await this.repo.deactivate(id);
  }

  async clone(id: string, name: string): Promise<Role> {
    const original = await this.getById(id);
    
    const existing = await this.repo.findByName(name);
    if (existing) {
      throw new BusinessError('Ya existe un rol con ese nombre');
    }

    const newId = uuidv4();
    const createData: CreateRoleDto & { id: string } = {
      id: newId,
      name,
      description: `Clon de ${original.name}`,
      permissions: original.permissions as any
    };

    await this.repo.create(createData);
    return this.getById(newId);
  }
}
