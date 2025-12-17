import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDto, RegisterDto } from '@task_manager/dtos';
import { LoggerService } from '@task_manager/logger';

@Injectable()
export class AuthGatewayService {
  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
    private readonly logger: LoggerService,
  ) {}

  async login(data: LoginDto) {
    this.logger.info('Sending login request to auth-service');

    return firstValueFrom(this.client.send({ cmd: 'login' }, data));
  }

  async register(data: RegisterDto) {
    this.logger.info('Sending register request to auth-service');

    return firstValueFrom(this.client.send({ cmd: 'register' }, data));
  }

  async refresh(refreshToken: string) {
    this.logger.info('Sending refresh request to auth-service');

    return firstValueFrom(
      this.client.send({ cmd: 'refresh' }, { refreshToken }),
    );
  }

  async forgotPassword(data: { email: string; username: string }) {
    this.logger.info('Sending forgot-password request to auth-service', {
      email: data.email,
    });

    return firstValueFrom(this.client.send({ cmd: 'forgot-password' }, data));
  }

  async resetPassword(data: { token: string; newPassword: string }) {
    this.logger.info('Sending reset-password request to auth-service');

    return firstValueFrom(this.client.send({ cmd: 'reset-password' }, data));
  }

  async users(userId: string) {
    this.logger.info('Fetching users from auth-service', {
      userId,
    });

    return firstValueFrom(this.client.send({ cmd: 'users' }, { userId }));
  }
}
