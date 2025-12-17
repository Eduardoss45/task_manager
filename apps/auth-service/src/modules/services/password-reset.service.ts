import { UserRepository } from '../repositories/user.repository';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { ForgotPasswordDto, ResetPasswordDto } from '@task_manager/dtos';

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly users: UserRepository,
    private readonly resets: PasswordResetRepository,
  ) {}

  async generate(data: ForgotPasswordDto) {
    const user = await this.users.findByEmail(data.email);

    if (!user || user.username.toLowerCase() !== data.username.toLowerCase()) {
      return { message: 'If user exists, token was generated' };
    }

    const token = randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);

    await this.resets.saveToken({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return { resetToken: token, expiresIn: '10 minutes' };
  }

  async reset(data: ResetPasswordDto) {
    const reset = await this.resets.findValidToken();

    if (!reset) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid or expired reset token',
      });
    }

    const valid = await bcrypt.compare(data.token, reset.tokenHash);

    if (!valid) {
      throw new RpcException({
        statusCode: 401,
        message: 'Invalid reset token',
      });
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);

    await this.users.updatePassword(reset.userId, passwordHash);
    await this.resets.invalidateToken(reset.id);

    return { message: 'Password updated successfully' };
  }

  async healthCheckPasswordDatabase(): Promise<'up' | 'down'> {
    const dbPasswordResetStatus =
      await this.resets.checkDatabaseHealthPassword();
    return dbPasswordResetStatus ? 'up' : 'down';
  }
}
