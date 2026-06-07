import { Controller, Delete, Get, Param, Patch, Body, Query } from '@nestjs/common';
import { JoiValidationPipe } from 'src/core/validators/joi-validation.pipe';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { updateUserSchema } from './validations/request/update-user.request';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(@Query() query: { q?: string; role?: string }) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateUserSchema)) updateDto: UpdateUserDto,
  ) {
    return this.userService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
