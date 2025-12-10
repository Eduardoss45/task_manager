import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: RegisterDto) {
    return this.authService.register(data.email, data.username, data.password);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: LoginDto) {
    const user = await this.authService.validateUser(data.email, data.password);
    if (!user) return { error: 'Invalid credentials' };
    return this.authService.login(user);
  }

  @MessagePattern({ cmd: 'refreshToken' })
  async refreshToken(@Payload() token: string) {
    return this.authService.refreshToken(token);
  }
}