import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth-gateway.service';
import { LoginDto, RegisterDto } from '@jungle/dtos';
import { Response, Request } from 'express';

@ApiTags('Auth')
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
  @ApiOperation({ summary: 'Registro de novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    const result = await this.auth.register(body);

    this.setAuthCookies(res, result);

    return res.json({
      status: 'created',
      user: result.user,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const result = await this.auth.login(body);

    this.setAuthCookies(res, result);

    return res.json({
      user: result.user,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renova o access token usando refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens renovados' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou ausente',
  })
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
