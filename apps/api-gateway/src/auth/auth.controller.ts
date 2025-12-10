import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Post('login')
  async login(
    @Body() body: { email: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const payload = { sub: 'user-id-123', username: body.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('register')
  async register(
    @Body() body: { email: string; username: string; password: string },
  ) {
    return { message: 'Mock: usuário registrado', user: body };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['refreshToken'];
    if (!token) {
      return { error: 'No refresh token provided' };
    }

    try {
      const payload = this.jwtService.verify(token);
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, username: payload.username },
        { expiresIn: '15m' },
      );
      return { accessToken: newAccessToken };
    } catch (e) {
      return { error: 'Invalid refresh token' };
    }
  }
}
