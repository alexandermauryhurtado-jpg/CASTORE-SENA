import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository, UserWithRole } from './auth.repository';
import { LoginDto, RecoverPasswordDto, ResetPasswordDto } from './auth.schema';
import { UnauthorizedError } from '../../shared/exceptions/UnauthorizedError';
import { BusinessError } from '../../shared/exceptions/BusinessError';
import { NotFoundError } from '../../shared/exceptions/NotFoundError';
import { comparePassword, hashPassword } from '../../shared/utils/hash.util';
import { generateToken } from '../../shared/utils/jwt.util';
import { sendMail } from '../../config/mailer';
import { env } from '../../config/env';

export interface LoginResult {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    roleId: string;
    roleName: string;
    firstLogin: boolean;
  };
}

export class AuthService {
  constructor(private repo: AuthRepository) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.repo.findUserByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Tu cuenta está desactivada. Contacta al administrador');
    }

    const isPasswordValid = await comparePassword(dto.password, user.passwordHash!);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    await this.repo.updateLastLogin(user.id);

    const token = generateToken({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions: user.permissions,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roleId: user.roleId,
        roleName: user.roleName,
        firstLogin: !!user.firstLogin,
      },
    };
  }

  async recoverPassword(dto: RecoverPasswordDto): Promise<void> {
    const user = await this.repo.findUserByEmail(dto.email);

    if (!user) {
      // Security: do not reveal that the email doesn't exist
      return;
    }

    await this.repo.invalidateAllUserResets(user.id);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await this.repo.createPasswordReset({
      id: uuidv4(),
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const resetLink = `${env.FRONTEND_URL}/reset-password/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #F8623A; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">SGIA</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hola, ${user.fullName}</h2>
          <p>Has solicitado restablecer tu contraseña para el Sistema de Gestión de Inventario Automotriz (SGIA).</p>
          <p>Haz clic en el botón de abajo para continuar con el proceso:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #F8623A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
          </div>
          <p style="color: #666; font-size: 0.9em;">Este enlace expirará en 30 minutos.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 0.8em;">Si no solicitaste este cambio, puedes ignorar este correo con seguridad.</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; color: #888; font-size: 0.8em;">
          © ${new Date().getFullYear()} SGIA - Todos los derechos reservados
        </div>
      </div>
    `;

    await sendMail({
      to: user.email,
      subject: 'Recuperación de contraseña - SGIA',
      html,
    });
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const reset = await this.repo.findPasswordReset(tokenHash);

    if (!reset) {
      throw new BusinessError('El enlace es inválido o ha expirado');
    }

    const passwordHash = await hashPassword(dto.password);
    await this.repo.updatePassword(reset.userId, passwordHash);
    await this.repo.markPasswordResetAsUsed(reset.id);
  }

  async getMe(userId: string): Promise<UserWithRole> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('Usuario');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithRole;
  }
}
