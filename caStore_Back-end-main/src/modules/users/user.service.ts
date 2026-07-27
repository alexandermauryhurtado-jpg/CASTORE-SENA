import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository, UserWithRole } from './user.repository';
import { RoleRepository } from '../roles/role.repository';
import { CreateUserDto, UpdateUserDto, UpdateProfileDto, ChangePasswordDto, GetUsersDto } from './user.schema';
import { hashPassword, comparePassword } from '../../shared/utils/hash.util';
import { sendMail } from '../../config/mailer';
import { env } from '../../config/env';
import { PaginatedResult } from '../../shared/types';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { ConflictError } from '../../shared/exceptions/ConflictError';
import { BusinessError } from '../../shared/exceptions/BusinessError';

export class UserService {
  constructor(
    private repo: UserRepository,
    private roleRepo: RoleRepository = new RoleRepository()
  ) {}

 async create(dto: CreateUserDto): Promise<UserWithRole> {
    // 1. Verificar email
    const existingUser = await this.repo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('email');
    }

    // 2. Verificar rol
    const role = await this.roleRepo.findById(dto.roleId);
    if (!role) {
      throw new NotFoundError('Rol');
    }

    // 3. Generar contraseña temporal
    const tempPassword = this.generateTempPassword();

    // 4. Hashear
    const passwordHash = await hashPassword(tempPassword);

    // 5. Generar ID
    const id = uuidv4();

    // 6. Crear en BD
    await this.repo.create({
      id,
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      roleId: dto.roleId,
    });

    // 7. Enviar correo
    await this.sendWelcomeMail(dto.fullName, dto.email, tempPassword);

    // 8. Retornar
    return this.getById(id);
  }

  async getAll(filters: GetUsersDto): Promise<PaginatedResult<UserWithRole>> {
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

  async getById(id: string): Promise<UserWithRole> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError('Usuario');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserWithRole> {
    await this.getById(id);

    if (dto.email) {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('email');
      }
    }

    if (dto.roleId) {
      const role = await this.roleRepo.findById(dto.roleId);
      if (!role) {
        throw new NotFoundError('Rol');
      }
    }

    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async toggleStatus(id: string, isActive: boolean, requestingUserId: string): Promise<UserWithRole> {
    await this.getById(id);

    if (id === requestingUserId && !isActive) {
      throw new BusinessError('No puedes desactivar tu propia cuenta');
    }

    await this.repo.updateStatus(id, isActive);
    return this.getById(id);
  }

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    const userWithPass = await this.repo.findByIdWithPassword(id);
    if (!userWithPass) {
      throw new NotFoundError('Usuario');
    }

    const isValid = await comparePassword(dto.currentPassword, userWithPass.passwordHash);
    if (!isValid) {
      throw new BusinessError('La contraseña actual no es correcta');
    }

    const newHash = await hashPassword(dto.newPassword);
    await this.repo.updatePassword(id, newHash);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<UserWithRole> {
    await this.getById(id);

    if (dto.email) {
      const existing = await this.repo.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new ConflictError('email');
      }
    }

    await this.repo.update(id, dto);
    return this.getById(id);
  }

  async resendPassword(id: string): Promise<void> {
    const user = await this.getById(id);
    const tempPassword = this.generateTempPassword();
    const hash = await hashPassword(tempPassword);

    await this.repo.updatePassword(id, hash, false);
    // Nota: Aunque updatePassword pone first_login = 0, el requerimiento dice:
    // "Hashear y actualizar con repo.updatePassword pero sin cambiar first_login (dejarlo en 1)"
    // Esto implica que si el usuario no ha entrado, debe seguir en 1.
    // Pero repo.updatePassword lo pone en 0.
    // Corregiré el repo o el proceso.
    
    // Si queremos mantener first_login en 1, necesitamos un método especial o un parámetro.
    // El repo actual: UPDATE users SET password_hash = ?, first_login = 0, updated_at = NOW() WHERE id = ?
    // Voy a modificar el repo para que admita resetear o no el first_login, 
    // o simplemente llamar a un nuevo método en el repo.
    
    // Re-leyendo: "pero sin cambiar first_login (dejarlo en 1)"
    // Esto sugiere que si estaba en 1, se queda en 1.
    
    // Enviamos el correo
    await this.sendWelcomeMail(user.fullName, user.email, tempPassword);
  }

  private generateTempPassword(): string {
    const random = crypto.randomBytes(3).toString('hex').substring(0, 5);
    return `Tmp${random}1!`;
  }

  private async sendWelcomeMail(name: string, email: string, tempPass: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #F8623A; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SGIA</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Bienvenido, ${name}</h2>
          <p>Se ha creado una cuenta para ti en el Sistema de Gestión de Inventario Alimentario (SGIA).</p>
          <p>Tus credenciales de acceso son:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Correo:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> ${tempPass}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.FRONTEND_URL}" style="background-color: #F8623A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Acceder al Sistema</a>
          </div>
          <p style="color: #666; font-size: 0.9em;"><strong>Aviso importante:</strong> Por seguridad, se te pedirá cambiar esta contraseña en tu primer acceso al sistema.</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; color: #888; font-size: 0.8em;">
          © ${new Date().getFullYear()} SGIA - Todos los derechos reservados
        </div>
      </div>
    `;

    await sendMail({
      to: email,
      subject: 'Bienvenido a SGIA - Tus credenciales de acceso',
      html,
    });
  }
}
