import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const message = this.reflector.get<string | undefined>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((payload: any) => {
        if (message === undefined) {
          return {
            statusCode: payload.statusCode,
            message: payload.message,
            data: payload.data,
          };
        }
        return {
          statusCode: response.statusCode,
          message,
          data: payload ?? ({} as T),
        };
      }),
    );
  }
}
