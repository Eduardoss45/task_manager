import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { PasswordResetService } from '../services/password-reset.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @MessagePattern({ cmd: 'login' })
  login(data: any) {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'register' })
  register(data: any) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'refresh' })
  refresh(data: any) {
    return this.authService.refresh(data.refreshToken);
  }

  @MessagePattern({ cmd: 'forgot-password' })
  forgotPassword(data: any) {
    return this.authService.forgotPassword(data);
  }

  @MessagePattern({ cmd: 'reset-password' })
  resetPassword(data: any) {
    return this.authService.resetPassword(data);
  }

  @MessagePattern({ cmd: 'users' })
  users(data: any) {
    return this.authService.getUsersFromAccessToken(data.userId);
  }

  @MessagePattern({ cmd: 'auth-start' })
  async authHealthCheck() {
    const authRes = await this.authService.healthCheckAuthDatabase();
    const resetPasswordRes =
      await this.passwordResetService.healthCheckPasswordDatabase();

    if (authRes === 'up' && resetPasswordRes === 'up') {
      return 'up';
    }
    return 'down';
  }
}
