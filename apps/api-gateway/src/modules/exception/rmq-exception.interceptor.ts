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
          switch (err.statusCode) {
            case 400:
              return throwError(() => new BadRequestException(err.message));
            case 404:
              return throwError(() => new NotFoundException(err.message));
          }
        }

        return throwError(
          () =>
            new InternalServerErrorException(
              err?.message || 'Unexpected RPC error',
            ),
        );
      }),
    );
  }
}
