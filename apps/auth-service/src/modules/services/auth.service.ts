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
} from '@TaskManager/dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordReset: PasswordResetService,
  ) {}

  private async getAvailableUsers(userId: string) {
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
    return this.passwordReset.generate(data);
  }

  async resetPassword(data: ResetPasswordDto) {
    return this.passwordReset.reset(data);
  }

  async register(data: RegisterDto) {
    const exists = await this.users.findByEmail(data.email);

    if (exists) {
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
    const user = await this.users.findByEmail(data.email);

    if (!user) {
      throw new RpcException({ statusCode: 404, message: 'User not found' });
    }

    const valid = await bcrypt.compare(data.password, user.password);

    if (!valid) {
      throw new RpcException({
        statusCode: 400,
        message: 'Invalid credentials',
      });
    }

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
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken);

      const user = await this.users.findById(payload.sub);

      if (!user || !user.refreshTokenHash) {
        throw new UnauthorizedException('Access denied');
      }

      const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

      if (!valid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.users.updateRefreshToken(user.id, newRefreshHash);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUsersFromAccessToken(userId: string) {
    const availableUsers = await this.getAvailableUsers(userId);
    return {
      availableUsers,
    };
  }

  async healthCheckAuthDatabase(): Promise<'up' | 'down'> {
    const requiredVars = ['RMQ_URL', 'JWT_SECRET', 'DATABASE_URL'];
    const missingVars = requiredVars.filter((v) => !process.env[v]);

    if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars);
      return 'down';
    }

    const dbUsersStatus = await this.users.checkDatabaseHealthUser();
    return dbUsersStatus ? 'up' : 'down';
  }
}
