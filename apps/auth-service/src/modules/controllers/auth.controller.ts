import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';
import { LoggerService } from '@task_manager/logger';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
    private readonly logger: LoggerService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  login(data: any) {
    this.logger.info('Login request received', { email: data.email });
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'register' })
  register(data: any) {
    this.logger.info('Register request received', {
      email: data.email,
      username: data.username,
    });
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'refresh' })
  refresh(data: any) {
    this.logger.info('Refresh token request received');
    return this.authService.refresh(data.refreshToken);
  }

  @MessagePattern({ cmd: 'forgot-password' })
  forgotPassword(data: any) {
    this.logger.info('Forgot password requested', {
      email: data.email,
      username: data.username,
    });
    return this.authService.forgotPassword(data);
  }

  @MessagePattern({ cmd: 'reset-password' })
  resetPassword(data: any) {
    this.logger.info('Reset password attempt');
    return this.authService.resetPassword(data);
  }

  @MessagePattern({ cmd: 'users' })
  users(data: any) {
    this.logger.info('Fetch available users', { userId: data.userId });
    return this.authService.getUsersFromAccessToken(data.userId);
  }

  @MessagePattern({ cmd: 'auth-start' })
  async authHealthCheck() {
    this.logger.info('Auth health check requested');

    const authRes = await this.authService.healthCheckAuthDatabase();
    const resetPasswordRes =
      await this.passwordResetService.healthCheckPasswordDatabase();

    return authRes === 'up' && resetPasswordRes === 'up' ? 'up' : 'down';
  }
}
