import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class RmqExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err?.statusCode && err?.message) {
          return throwError(() =>
            this.mapException(err.statusCode, err.message),
          );
        }

        if (err?.response?.statusCode && err?.response?.message) {
          return throwError(() =>
            this.mapException(err.response.statusCode, err.response.message),
          );
        }

        if (typeof err?.message === 'string') {
          return throwError(
            () => new InternalServerErrorException(err.message),
          );
        }

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
      default:
        return new InternalServerErrorException(message);
    }
  }
}
