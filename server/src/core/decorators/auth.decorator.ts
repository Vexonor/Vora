import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/features/user/enums/user-role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Auth = (...roles: UserRole[]) =>
  applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
