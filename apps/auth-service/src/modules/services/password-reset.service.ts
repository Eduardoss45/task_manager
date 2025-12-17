import { UserRepository } from '../repositories/user.repository';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { ForgotPasswordDto, ResetPasswordDto } from '@task_manager/dtos';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { LoggerService } from '@task_manager/logger';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly users: UserRepository,
    private readonly resets: PasswordResetRepository,
    private readonly logger: LoggerService,
  ) {}

  async generate(data: ForgotPasswordDto) {
    this.logger.info('Password reset requested', { email: data.email });

    const user = await this.users.findByEmail(data.email);
    if (!user) {
      return { message: 'If user exists, token was generated' };
    }

    const token = randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);

    await this.resets.saveToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    this.logger.info('Password reset token generated', { userId: user.id });

    return { resetToken: token, expiresIn: '10 minutes' };
  }

  async reset(data: ResetPasswordDto) {
    this.logger.info('Password reset attempt');

    const reset = await this.resets.findValidToken();
    if (!reset) {
      this.logger.warn('Invalid or expired reset token');
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid or expired reset token',
      });
    }

    const valid = await bcrypt.compare(data.token, reset.tokenHash);
    if (!valid) {
      this.logger.warn('Invalid reset token');
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid reset token',
      });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.users.updatePassword(reset.userId, passwordHash);
    await this.resets.invalidateToken(reset.id);

    this.logger.info('Password updated successfully', {
      userId: reset.userId,
    });

    return { message: 'Password updated successfully' };
  }

  async healthCheckPasswordDatabase(): Promise<'up' | 'down'> {
    try {
      await this.resets.checkDatabaseHealthPassword();
      return 'up';
    } catch {
      this.logger.error('Password reset DB health check failed');
      return 'down';
    }
  }
}
