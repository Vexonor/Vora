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
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material } from './entities/material.entity';
import { MaterialService } from './material.service';
import { materialIdParamSchema } from './validations/params/material-id.param';
import { createMaterialScheme } from './validations/requests/create-material.request';

@Controller()
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createMaterialScheme))
    createMaterialDto: CreateMaterialDto,
    @CurrentUser() user: User,
  ) {
    return this.materialService.create(createMaterialDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query, @CurrentUser() user: User) {
    return this.materialService.findAll(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', new JoiValidationParamPipe(materialIdParamSchema))
    material: Material,
  ) {
    return this.materialService.findOne(material);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', new JoiValidationParamPipe(materialIdParamSchema))
    material: Material,
    @Body(new JoiValidationPipe(createMaterialScheme))
    updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialService.update(material, updateMaterialDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', new JoiValidationParamPipe(materialIdParamSchema))
    material: Material,
  ) {
    return this.materialService.remove(material);
  }
}
