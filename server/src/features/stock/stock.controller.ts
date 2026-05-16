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
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { Stock } from './entities/stock.entity';
import { StockService } from './stock.service';
import { stockIdParamSchema } from './validations/params/stock-id.param';
import { createStockScheme } from './validations/requests/create-stock.request';
import { updateStockScheme } from './validations/requests/update-stock.request';

@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body(new JoiValidationPipe(createStockScheme))
    createStockDto: CreateStockDto,
    @CurrentUser() user: User,
  ) {
    return this.stockService.create(createStockDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query() query, @CurrentUser() user: User) {
    return this.stockService.findAll(query, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', new JoiValidationParamPipe(stockIdParamSchema)) stock: Stock,
  ) {
    return this.stockService.findOne(stock);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', new JoiValidationParamPipe(stockIdParamSchema)) stock: Stock,
    @Body(new JoiValidationPipe(updateStockScheme))
    updateStockDto: UpdateStockDto,
  ) {
    return this.stockService.update(stock, updateStockDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', new JoiValidationParamPipe(stockIdParamSchema)) stock: Stock,
  ) {
    return this.stockService.remove(stock);
  }
}
