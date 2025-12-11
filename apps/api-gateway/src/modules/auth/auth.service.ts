import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  async login(data: { email: string; username: string; password: string }) {
    return firstValueFrom(this.client.send({ cmd: 'login' }, data));
  }

  async register(data: { email: string; username: string; password: string }) {
    return firstValueFrom(this.client.send({ cmd: 'register' }, data));
  }

  async refresh(refreshToken: string) {
    return firstValueFrom(
      this.client.send({ cmd: 'refresh' }, { refreshToken }),
    );
  }
}
