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

  private generateTokens(user: {
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
    try {
      const hashed = await bcrypt.hash(data.password, 10);

      const user = await this.users.createUser({
        email: data.email,
        username: data.username,
        password: hashed,
      });

      const tokens = this.generateTokens(user);

      return {
        status: 'created',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        ...tokens,
      };
    } catch (err: any) {
      if (err.code === '23505') {
        return { error: 'Email already registered', field: 'email' };
      }
      return { error: 'Internal error', details: err.message };
    }
  }

  async login(data: LoginDto) {
    const user = await this.users.findByEmail(data.email);
    if (!user) return { error: 'User not found' };

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) return { error: 'Invalid credentials' };

    const tokens = this.generateTokens(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const tokens = this.generateTokens(payload.sub);
      return tokens;
    } catch {
      return { error: 'Invalid token' };
    }
  }
}
