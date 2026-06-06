import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorCodeEnum } from '../enums/error-code.enum';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          statusCode: 401,
          error: ErrorCodeEnum.INVALID_CREDENTIALS,
        })
      );
    }
    return user;
  }
}
