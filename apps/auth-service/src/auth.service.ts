import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from './entity/repository/user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const hashed = await bcrypt.hash(data.password, 10);

    const user = await this.users.createUser({
      email: data.email,
      username: data.username,
      password: hashed,
    });

    return { status: 'created', id: user.id, email: user.email };
  }

  async login(data: LoginDto) {
    const user = await this.users.findByEmail(data.email);
    if (!user) {
      return { error: 'User not found' };
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return { error: 'Invalid credentials' };
    }

    const accessToken = this.jwtService.sign({ sub: user.id });
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
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
      const access = this.jwtService.sign({ sub: payload.sub });

      return { accessToken: access };
    } catch {
      return { error: 'Invalid token' };
    }
  }
}
