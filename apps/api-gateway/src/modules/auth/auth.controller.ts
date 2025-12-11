import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; username: string; password: string },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; username: string; password: string },
  ) {
    return this.authService.login(body);
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return { error: 'No refresh token provided' };
    }
    return this.authService.refresh(refreshToken);
  }
}
