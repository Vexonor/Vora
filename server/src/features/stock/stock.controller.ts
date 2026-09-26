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
import { Auth } from 'src/core/decorators/auth.decorator';
import { ResponseMessage } from 'src/core/decorators/response-message.decorator';
import { JoiValidationPipe } from 'src/core/pipes/joi-validation.pipe';
import { UserRole } from '../user/enums/user-role.enum';
import { SaveStockDto } from './dto/save-stock.dto';
import type { StockListQuery } from './models/stock.model';
import { StockService } from './stock.service';
import {
  createStockSchema,
  updateStockSchema,
} from './validations/save-stock.schema';

@Auth(UserRole.MANAGER, UserRole.KITCHEN)
@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @ResponseMessage('Successfully created stock')
  create(@Body(new JoiValidationPipe(createStockSchema)) dto: SaveStockDto) {
    return this.stockService.create(dto);
  }

  @Get()
  @ResponseMessage('Successfully get all stocks')
  findAll(@Query() query: StockListQuery) {
    return this.stockService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Successfully get stock')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.findOne(id);
  }

  @Put(':id')
  @ResponseMessage('Successfully update stock')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new JoiValidationPipe(updateStockSchema)) dto: SaveStockDto,
  ) {
    return this.stockService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Successfully delete stock')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stockService.remove(id);
  }
}
