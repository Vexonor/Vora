import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const response = host.switchToHttp().getResponse();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
      const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      httpAdapter.reply(
        response,
        { statusCode, message: 'Internal server error' },
        statusCode,
      );
      return;
    }

    const statusCode = exception.getStatus();
    const body = exception.getResponse();
    httpAdapter.reply(
      response,
      typeof body === 'string' ? { statusCode, message: body } : body,
      statusCode,
    );
  }
}
