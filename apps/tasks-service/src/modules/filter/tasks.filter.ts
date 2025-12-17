import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { throwError } from 'rxjs';

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter {
  catch(exception: any) {
    if (exception.getStatus) {
      return throwError(() => ({
        statusCode: exception.getStatus(),
        message: exception.message,
      }));
    }

    return throwError(() => ({
      statusCode: 500,
      message: exception.message || 'Internal server error',
    }));
  }
}
