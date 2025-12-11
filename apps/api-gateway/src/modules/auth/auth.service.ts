import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  async login(data: LoginDto) {
    return firstValueFrom(this.client.send({ cmd: 'login' }, data));
  }

  async register(data: RegisterDto) {
    return firstValueFrom(this.client.send({ cmd: 'register' }, data));
  }

  async refresh(refreshToken: RefreshTokenDto) {
    return firstValueFrom(
      this.client.send({ cmd: 'refresh' }, { refreshToken }),
    );
  }
}
