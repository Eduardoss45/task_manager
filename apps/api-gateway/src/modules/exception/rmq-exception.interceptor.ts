import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { LoggerService } from '@task_manager/logger';

@Injectable()
export class RmqExceptionInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err?.statusCode && err?.message) {
          this.logger.info('RPC error received', {
            statusCode: err.statusCode,
            message: err.message,
          });

          return throwError(() =>
            this.mapException(err.statusCode, err.message),
          );
        }

        if (err?.response?.statusCode && err?.response?.message) {
          this.logger.info('RPC error response received', {
            statusCode: err.response.statusCode,
            message: err.response.message,
          });

          return throwError(() =>
            this.mapException(err.response.statusCode, err.response.message),
          );
        }

        if (typeof err?.message === 'string') {
          this.logger.info('Unhandled RPC error', {
            message: err.message,
          });

          return throwError(
            () => new InternalServerErrorException(err.message),
          );
        }

        this.logger.info('Unexpected RPC error', {
          rawError: err,
        });

        return throwError(
          () => new InternalServerErrorException('Unexpected RPC error'),
        );
      }),
    );
  }

  private mapException(statusCode: number, message: string) {
    switch (statusCode) {
      case 400:
        return new BadRequestException(message);
      case 404:
        return new NotFoundException(message);
      case 409:
        return new ConflictException(message);
      default:
        return new InternalServerErrorException(message);
    }
  }
}
