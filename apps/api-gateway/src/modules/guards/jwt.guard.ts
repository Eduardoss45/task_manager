import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '@task_manager/logger';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      this.logger.info('Unauthorized access attempt', {
        reason: err?.message ?? 'Invalid or missing token',
      });

      throw err || new UnauthorizedException();
    }

    return user;
  }
}
