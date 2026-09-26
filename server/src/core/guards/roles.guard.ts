import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/features/user/models/user.model';
import { UserRole } from 'src/features/user/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/auth.decorator';
import { ErrorCode } from '../enums/error-code.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!allowedRoles?.length) return true;

    const user = context.switchToHttp().getRequest<{ user?: User }>().user;
    if (user && allowedRoles.includes(Number(user.role))) return true;

    throw new HttpException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN);
  }
}
