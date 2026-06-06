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
import { JoiValidationParamPipe } from 'src/core/validators/joi-validation-param.pipe';
import { JoiValidationPipe } from 'src/core/validators/joi-validation.pipe';
import { User } from '../user/entities/user.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Unit } from './entities/unit.entity';
import { UnitService } from './unit.service';
import { unitIdParamSchema } from './validations/params/unit-id.param';
import { createUnitScheme } from './validations/requests/create-unit.request';

@Controller()
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createUnitScheme))
    createUnitDto: CreateUnitDto,
    @CurrentUser() user: User,
  ) {
    return this.unitService.create(createUnitDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query, @CurrentUser() user: User) {
    return this.unitService.findAll(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', new JoiValidationParamPipe(unitIdParamSchema)) unit: Unit,
  ) {
    return this.unitService.findOne(unit);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', new JoiValidationParamPipe(unitIdParamSchema)) unit: Unit,
    @Body(new JoiValidationPipe(createUnitScheme))
    updateUnitDto: UpdateUnitDto,
  ) {
    return this.unitService.update(unit, updateUnitDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', new JoiValidationParamPipe(unitIdParamSchema)) unit: Unit,
  ) {
    return this.unitService.remove(unit);
  }
}
