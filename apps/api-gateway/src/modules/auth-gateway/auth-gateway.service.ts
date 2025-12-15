import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDto, RegisterDto } from '@jungle/dtos';

@Injectable()
export class AuthGatewayService {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  async login(data: LoginDto) {
    return firstValueFrom(this.client.send({ cmd: 'login' }, data));
  }

  async register(data: RegisterDto) {
    return firstValueFrom(this.client.send({ cmd: 'register' }, data));
  }

  async refresh(refreshToken: string) {
    return firstValueFrom(
      this.client.send({ cmd: 'refresh' }, { refreshToken }),
    );
  }
}
