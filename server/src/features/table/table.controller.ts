import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { ListQuery } from 'src/core/database/list-query';
import { Auth, Roles } from 'src/core/decorators/auth.decorator';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { STAFF_ROLES, UserRole } from '../user/enums/user-role.enum';
import { SaveTableDto } from './dto/save-table.dto';
import { TableService } from './table.service';
import { saveTableSchema } from './validations/save-table.schema';

@Auth(...STAFF_ROLES)
@Controller()
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  @ResponseMessage('Successfully created table')
  create(@Body(new JoiValidationPipe(saveTableSchema)) dto: SaveTableDto) {
    return this.tableService.create(dto);
  }

  @Get()
  @ResponseMessage('Successfully get all tables')
  findAll(@Query() query: ListQuery) {
    return this.tableService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Successfully get table')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tableService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  @ResponseMessage('Successfully update table')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JoiValidationPipe(saveTableSchema)) dto: SaveTableDto,
  ) {
    return this.tableService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER, UserRole.KITCHEN)
  @ResponseMessage('Successfully delete table')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tableService.remove(id);
  }
}
