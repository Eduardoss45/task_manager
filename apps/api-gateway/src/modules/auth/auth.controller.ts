import { Controller, Post, Body, Req, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from '@jungle/dtos';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setAuthCookies(res: Response, tokens: any) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });
  }

  @Post('register')
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    const result = await this.auth.register(body);

    if ('error' in result) {
      return res.status(400).json(result);
    }

    this.setAuthCookies(res, result);

    return res.json({
      status: 'created',
      user: result.user,
    });
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const result = await this.auth.login(body);

    if ('error' in result) {
      return res.status(400).json(result);
    }

    this.setAuthCookies(res, result);

    return res.json({
      user: result.user,
    });
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const result = await this.auth.refresh(refreshToken);

    if ('error' in result) {
      return res.status(401).json(result);
    }

    this.setAuthCookies(res, result);

    return res.json({ status: 'refreshed' });
  }
}
