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
import {
  LoginDto,
  RegisterDto,
  AssignedUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '@task_manager/dtos';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { LoggerService } from '@task_manager/logger';
import {
  ForgotPasswordCommand,
  LoginCommand,
  RegisterCommand,
  ResetPasswordCommand,
} from '@task_manager/types';

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
  @ApiOperation({
    summary: 'Registra um novo usuário',
    description:
      'Endpoint de gateway. Apenas encaminha o comando de registro para o auth-service via mensageria.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({
    description: 'Usuário registrado com sucesso',
  })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const command: RegisterCommand = {
      email: dto.email,
      username: dto.username,
      password: dto.password,
    };

    this.logger.info('Register request received', {
      email: dto.email,
      username: dto.username,
    });

    const result = await this.auth.register(command);

    this.logger.info('User registered successfully', {
      userId: result.user.id,
    });

    this.setAuthCookies(res, result);

    return res.status(201).json({
      user: result.user,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Autentica o usuário',
    description:
      'Gateway de autenticação. Gera cookies HTTP-only após resposta do auth-service.',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Usuário autenticado com sucesso',
  })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const command: LoginCommand = {
      email: dto.email,
      password: dto.password,
    };

    this.logger.info('Login attempt', {
      email: dto.email,
    });

    const result = await this.auth.login(command);

    this.logger.info('User authenticated', {
      userId: result.user.id,
    });

    this.setAuthCookies(res, result);

    return res.json({
      user: result.user,
    });
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Renova o access token',
    description:
      'Utiliza o refresh token armazenado em cookie HTTP-only para solicitar novos tokens ao auth-service.',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token ausente ou inválido',
  })
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
    });
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Solicita redefinição de senha',
    description:
      'Encaminha solicitação de redefinição de senha ao auth-service. Sempre retorna resposta genérica por segurança.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    description: 'Solicitação processada',
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const command: ForgotPasswordCommand = {
      email: dto.email,
      username: dto.username,
    };

    this.logger.info('Forgot password requested', {
      email: dto.email,
      username: dto.username,
    });

    return this.auth.forgotPassword(command);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Redefine a senha do usuário',
    description:
      'Encaminha token e nova senha para o auth-service validar e atualizar a senha.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Senha redefinida com sucesso',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const command: ResetPasswordCommand = {
      token: dto.token,
      newPassword: dto.newPassword,
    };

    this.logger.info('Reset password attempt', {
      tokenProvided: true,
    });

    return this.auth.resetPassword(command);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista usuários disponíveis para atribuição',
    description:
      'Endpoint protegido. Retorna usuários disponíveis para atribuição em tarefas.',
  })
  @ApiOkResponse({
    description: 'Lista de usuários',
    type: AssignedUserDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Token JWT inválido ou ausente',
  })
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
