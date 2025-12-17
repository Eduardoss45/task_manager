import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGatewayService } from './auth-gateway.service';
import { LoginDto, RegisterDto, AssignedUserDto } from '@task_manager/dtos';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { LoggerService } from '@task_manager/logger';

@ApiTags('Auth')
@Controller('auth')
export class AuthGatewayController {
  constructor(
    private readonly auth: AuthGatewayService,
    private readonly logger: LoggerService,
  ) {}

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
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    this.logger.info('Register request received', {
      email: body.email,
      username: body.username,
    });

    const result = await this.auth.register(body);

    this.logger.info('User registered successfully', {
      userId: result.user.id,
    });

    this.setAuthCookies(res, result);

    return res.status(201).json({
      user: result.user,
      availableUsers: result.availableUsers ?? [],
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto, @Res() res: Response) {
    this.logger.info('Login attempt', {
      email: body.email,
    });

    const result = await this.auth.login(body);

    this.logger.info('User authenticated', {
      userId: result.user.id,
    });

    this.setAuthCookies(res, result);

    return res.json({
      user: result.user,
      availableUsers: result.availableUsers,
    });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renova o access token usando refresh token' })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      this.logger.info('Refresh token missing', {
        endpoint: 'POST /auth/refresh',
      });

      return res.status(401).json({ error: 'No refresh token provided' });
    }

    this.logger.info('Token refresh requested');

    const result = await this.auth.refresh(refreshToken);

    this.logger.info('Token refreshed successfully', {
      userId: result.user.id,
    });

    this.setAuthCookies(res, result);

    return res.json({
      user: result.user,
      availableUsers: result.availableUsers,
    });
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicita redefinição de senha' })
  async forgotPassword(@Body() body: { email: string; username: string }) {
    this.logger.info('Forgot password requested', {
      email: body.email,
      username: body.username,
    });

    return this.auth.forgotPassword(body);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefine a senha usando token enviado por email' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    this.logger.info('Reset password attempt', {
      tokenProvided: true,
    });

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

    this.logger.info('Fetch available users', {
      userId,
    });

    const result = await this.auth.users(userId);

    return res.json({
      availableUsers: result.availableUsers ?? [],
    });
  }
}
