import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @MessagePattern({ cmd: 'users' })
  users(data: { userId: string }) {
    return this.authService.getUsersFromAccessToken(data.userId);
  }
}
