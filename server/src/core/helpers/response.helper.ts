import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class ResponseHelper {
  success(data: any, statusCode: number, message = 'successfully response') {
    return { data: data ?? {}, statusCode: statusCode, message: message };
  }

  fail(error: any = '', statusCode: number) {
    throw new HttpException(error, statusCode);
  }
}
