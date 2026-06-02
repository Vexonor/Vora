import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { JoiValidationPipe } from 'src/core/validators/joi-validation.pipe';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { createOrderSchema } from './validations/request/create-order.request';
import { updateOrderStatusSchema } from './validations/request/update-order-status.request';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(
    @Body(new JoiValidationPipe(createOrderSchema)) createOrderDto: CreateOrderDto
  ) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.orderService.findAll({ status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string, 
    @Body(new JoiValidationPipe(updateOrderStatusSchema)) updateDto: UpdateOrderStatusDto
  ) {
    return this.orderService.updateStatus(+id, updateDto);
  }
}
