import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly logger: LoggerService) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.accessToken,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    this.logger.info('JWT validated successfully', {
      userId: payload.sub,
    });

    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
    };
  }
}
