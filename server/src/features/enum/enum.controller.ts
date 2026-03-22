import { Controller, Get } from '@nestjs/common';
import { EnumService } from './enum.service';

@Controller()
export class EnumController {
  constructor(private readonly enumService: EnumService) {}

  @Get("user-roles")
  userRoles() {
    return this.enumService.userRoles();
  }
}
