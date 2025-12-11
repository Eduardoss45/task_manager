import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'login' })
  async handleLogin(data: {
    email: string;
    username: string;
    password: string;
  }) {
    console.log('Received login data:', data);
    // Aqui você processa o login, valida usuário, cria token etc.
    return { status: 'ok', user: data.email };
  }

  @MessagePattern({ cmd: 'register' })
  async handleRegister(data: {
    email: string;
    username: string;
    password: string;
  }) {
    console.log('Received register data:', data);
    // Aqui você processa o registro do usuário
    return { status: 'created', user: data.email };
  }

  @MessagePattern({ cmd: 'refresh' })
  async handleRefresh(data: { refreshToken: string }) {
    console.log('Received refresh token:', data.refreshToken);
    // Aqui você valida e renova o token
    return { accessToken: 'new-access-token' };
  }
}
