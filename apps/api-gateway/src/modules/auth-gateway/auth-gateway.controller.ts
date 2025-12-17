import { Controller, Post, Body, Req, Res, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGatewayService } from './auth-gateway.service';
import { LoginDto, RegisterDto, AssignedUserDto } from '@TaskManager/dtos';
import { Response, Request } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly auth: AuthGatewayService) {}

  private setAuthCookies(
    res: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
    },
  ) {
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro de novo usuário' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'edu@test.com',
          username: 'edu',
        },
      },
    },
  })
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    const result = await this.auth.register(body);

    this.setAuthCookies(res, result);

    return res.status(201).json({
      user: result.user,
      availableUsers: result.availableUsers ?? [],
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'edu@test.com',
          username: 'edu',
        },
      },
    },
  })
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const result = await this.auth.login(body);

    this.setAuthCookies(res, result);

    return res.json({
      user: result.user,
      availableUsers: result.availableUsers,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renova o access token usando refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'edu@test.com',
          username: 'edu',
        },
      },
    },
  })
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

    this.setAuthCookies(res, result);

    return res.json({
      user: result.user,
      availableUsers: result.availableUsers,
    });
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicita redefinição de senha' })
  @ApiResponse({
    status: 201,
    description: 'Token de redefinição enviado com sucesso',
    schema: {
      example: { message: 'Email de redefinição enviado' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email ou username inválido',
  })
  async forgotPassword(@Body() body: { email: string; username: string }) {
    return this.auth.forgotPassword(body);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefine a senha usando token enviado por email' })
  @ApiResponse({
    status: 200,
    description: 'Senha redefinida com sucesso',
    schema: {
      example: { message: 'Senha redefinida com sucesso' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou expirado',
  })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.auth.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  @ApiOperation({ summary: 'Obtém os usuários disponíveis para atribuição' })
  @ApiOkResponse({
    description: 'Lista de usuários disponíveis',
    type: AssignedUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token inválido ou ausente',
  })
  @ApiBearerAuth()
  async users(@Req() req: any, @Res() res: Response) {
    const userId = req.user.userId;

    const result = await this.auth.users(userId);

    return res.json({
      availableUsers: result.availableUsers ?? [],
    });
  }
}
