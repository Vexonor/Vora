import { Injectable } from '@nestjs/common';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { getUserRoleEnums } from '../user/enums/user-roles.enum';

@Injectable()
export class EnumService {
  constructor(
    private response: ResponseHelper
  ) {}
  async userRoles() {
    return this.response.success(
      getUserRoleEnums(),
      200,
      "Successfully retrieve user roles",
    );
  }
}
