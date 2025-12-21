import { UserRepository } from './../repositories/user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PasswordResetService } from './password-reset.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dtos';
import { LoggerService } from '../logger';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordReset: PasswordResetService,
    private readonly logger: LoggerService,
  ) {}

  private async getAvailableUsers(userId: string) {
    this.logger.info('Fetching available users', { userId });

    const users = await this.users.findAvailableUsers(userId);

    return users.map((u) => ({
      userId: u.id,
      username: u.username,
    }));
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    username: string;
  }) {
    this.logger.info('Generating JWT tokens', { userId: user.id });

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  async forgotPassword(data: ForgotPasswordDto) {
    this.logger.info('Forgot password request', { email: data.email });

    return this.passwordReset.generate(data);
  }

  async resetPassword(data: ResetPasswordDto) {
    this.logger.info('Reset password attempt');

    return this.passwordReset.reset(data);
  }

  async register(data: RegisterDto) {
    this.logger.info('Register attempt', { email: data.email });

    const exists = await this.users.findByEmail(data.email);

    if (exists) {
      this.logger.info('Register failed - email already in use', {
        email: data.email,
      });

      throw new RpcException({
        statusCode: 409,
        message: 'Email already in use',
      });
    }

    const hashed = await bcrypt.hash(data.password, 10);

    const user = await this.users.createUser({
      email: data.email,
      username: data.username,
      password: hashed,
    });

    this.logger.info('User created', { userId: user.id });

    const tokens = await this.generateTokens(user);

    const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.users.updateRefreshToken(user.id, refreshHash);

    return {
      status: 'created',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      ...tokens,
    };
  }

  async login(data: LoginDto) {
    this.logger.info('Login attempt', { email: data.email });

    const user = await this.users.findByEmail(data.email);

    if (!user) {
      this.logger.info('Login failed - user not found', {
        email: data.email,
      });

      throw new RpcException({ statusCode: 404, message: 'User not found' });
    }

    const valid = await bcrypt.compare(data.password, user.password);

    if (!valid) {
      this.logger.info('Login failed - invalid credentials', {
        userId: user.id,
      });

      throw new RpcException({
        statusCode: 400,
        message: 'Invalid credentials',
      });
    }

    this.logger.info('User authenticated', { userId: user.id });

    const tokens = await this.generateTokens(user);

    const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.users.updateRefreshToken(user.id, refreshHash);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    this.logger.info('Refresh token attempt');

    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken);
      const user = await this.users.findById(payload.sub);

      if (!user || !user.refreshTokenHash) {
        this.logger.info('Refresh failed - missing token hash', {
          userId: payload.sub,
        });

        throw new UnauthorizedException('Access denied');
      }

      const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

      if (!valid) {
        this.logger.info('Refresh failed - invalid refresh token', {
          userId: user.id,
        });

        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.users.updateRefreshToken(user.id, newRefreshHash);

      this.logger.info('Token refreshed', { userId: user.id });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        ...tokens,
      };
    } catch {
      this.logger.info('Refresh token rejected');

      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUsersFromAccessToken(userId: string) {
    const availableUsers = await this.getAvailableUsers(userId);

    return { availableUsers };
  }

  async logout(refreshToken: string) {
    this.logger.info('Logout attempt');

    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken);

      await this.users.updateRefreshToken(payload.sub, null);

      this.logger.info('Refresh token invalidated', {
        userId: payload.sub,
      });

      return { success: true };
    } catch {
      this.logger.info('Logout with invalid or expired token');
      return { success: true };
    }
  }

  async healthCheckAuthDatabase(): Promise<'up' | 'down'> {
    this.logger.info('Auth DB health check started');

    const requiredVars = ['RMQ_URL', 'JWT_SECRET', 'DATABASE_URL'];
    const missingVars = requiredVars.filter((v) => !process.env[v]);

    if (missingVars.length > 0) {
      this.logger.info('Missing environment variables', { missingVars });
      return 'down';
    }

    const dbUsersStatus = await this.users.checkDatabaseHealthUser();

    this.logger.info('Auth DB health check result', {
      status: dbUsersStatus ? 'up' : 'down',
    });

    return dbUsersStatus ? 'up' : 'down';
  }
}
