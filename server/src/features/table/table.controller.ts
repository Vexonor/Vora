import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { JoiValidationParamPipe } from 'src/core/pipes/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { User } from '../user/models/user.model';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { DiningTable } from './models/dining-table.model';
import { TableService } from './table.service';
import { tableIdParamSchema } from './validations/params/table-id.param';
import { createTableScheme } from './validations/requests/create-table.request';

@Controller()
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createTableScheme))
    createTableDto: CreateTableDto,
    @CurrentUser() user: User,
  ) {
    return this.tableService.create(createTableDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query, @CurrentUser() user: User) {
    return this.tableService.findAll(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', new JoiValidationParamPipe(tableIdParamSchema)) table: DiningTable,
  ) {
    return this.tableService.findOne(table);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', new JoiValidationParamPipe(tableIdParamSchema)) table: DiningTable,
    @Body(new JoiValidationPipe(createTableScheme))
    updateTableDto: UpdateTableDto,
  ) {
    return this.tableService.update(table, updateTableDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', new JoiValidationParamPipe(tableIdParamSchema)) table: DiningTable,
  ) {
    return this.tableService.remove(table);
  }
}
