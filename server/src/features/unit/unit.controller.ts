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
import { Auth } from 'src/core/decorators/auth.decorator';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { UserRole } from '../user/enums/user-role.enum';
import { SaveUnitDto } from './dto/save-unit.dto';
import { UnitService } from './unit.service';
import { saveUnitSchema } from './validations/save-unit.schema';

@Auth(UserRole.MANAGER, UserRole.KITCHEN)
@Controller()
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  @ResponseMessage('Successfully created unit')
  create(@Body(new JoiValidationPipe(saveUnitSchema)) dto: SaveUnitDto) {
    return this.unitService.create(dto);
  }

  @Get()
  @ResponseMessage('Successfully get all units')
  findAll(@Query() query: ListQuery) {
    return this.unitService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Successfully get unit')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.findOne(id);
  }

  @Put(':id')
  @ResponseMessage('Successfully update unit')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JoiValidationPipe(saveUnitSchema)) dto: SaveUnitDto,
  ) {
    return this.unitService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Successfully delete unit')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.remove(id);
  }
}
