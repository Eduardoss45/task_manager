import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './entity/repository/user.repository';
import { LoginDto, RegisterDto } from '@jungle/dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

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

  async register(data: RegisterDto) {
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
    if (!user) return { error: 'User not found' };

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) return { error: 'Invalid credentials' };

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
        throw new Error('Access denied');
      }

      const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

      if (!valid) throw new Error('Invalid refresh token');

      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
      await this.users.updateRefreshToken(user.id, newRefreshHash);

      return tokens;
    } catch {
      return { error: 'Invalid token' };
    }
  }
}
