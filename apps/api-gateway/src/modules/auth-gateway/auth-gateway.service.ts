import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import {
  ForgotPasswordCommand,
  LoginCommand,
  RegisterCommand,
  ResetPasswordCommand,
} from '../types';

@Injectable()
export class AuthGatewayService {
  constructor(
    @Inject('AUTH_SERVICE') private client: ClientProxy,
    private readonly logger: LoggerService,
  ) {}

  async login(command: LoginCommand) {
    this.logger.info('Sending login request to auth-service');
    return firstValueFrom(this.client.send({ cmd: 'login' }, command));
  }

  async register(command: RegisterCommand) {
    this.logger.info('Sending register request to auth-service');
    return firstValueFrom(this.client.send({ cmd: 'register' }, command));
  }

  async refresh(refreshToken: string) {
    this.logger.info('Sending refresh request to auth-service');

    return firstValueFrom(
      this.client.send({ cmd: 'refresh' }, { refreshToken }),
    );
  }

  async forgotPassword(command: ForgotPasswordCommand) {
    this.logger.info('Sending forgot-password request to auth-service', {
      email: command.email,
    });

    return firstValueFrom(
      this.client.send({ cmd: 'forgot-password' }, command),
    );
  }

  async resetPassword(command: ResetPasswordCommand) {
    this.logger.info('Sending reset-password request to auth-service');

    return firstValueFrom(this.client.send({ cmd: 'reset-password' }, command));
  }

  async users(userId: string) {
    this.logger.info('Fetching users from auth-service', {
      userId,
    });

    return firstValueFrom(this.client.send({ cmd: 'users' }, { userId }));
  }

  async logout(refreshToken: string) {
    this.logger.info('Sending logout request to auth-service');

    return firstValueFrom(
      this.client.send({ cmd: 'logout' }, { refreshToken }),
    );
  }
}
