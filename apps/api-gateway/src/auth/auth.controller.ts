import { Controller, Post, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { RegisterDto } from '@jungle/auth-service/src/auth/dto/register.dto';
import { LoginDto } from '@jungle/auth-service/src/auth/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private client: ClientProxy) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.client.send({ cmd: 'register' }, body).toPromise();
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.client.send({ cmd: 'login' }, body).toPromise();
  }

  @Post('refresh')
  async refresh(@Body() token: string) {
    return this.client.send({ cmd: 'refreshToken' }, token).toPromise();
  }
}
