import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { JoiValidationPipe } from 'src/core/validators/joi-validation.pipe';
import { SellingReportService } from './selling-report.service';
import { CreateSellingReportDto } from './dto/create-selling-report.dto';
import { createSellingReportSchema } from './validations/request/create-selling-report.request';
import { updateOperationalCostSchema } from './validations/request/update-operational-cost.request';

@Controller()
export class SellingReportController {
  constructor(private readonly sellingReportService: SellingReportService) {}

  @Post('generate')
  generate(@Body('date') date: string) {
    return this.sellingReportService.generate(date);
  }

  @Post()
  create(
    @Body(new JoiValidationPipe(createSellingReportSchema)) createDto: CreateSellingReportDto,
  ) {
    return this.sellingReportService.create(createDto);
  }

  @Get()
  findAll(@Query() query: { q?: string; month?: string; year?: string }) {
    return this.sellingReportService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellingReportService.findOne(+id);
  }

  @Patch(':id/operational-cost')
  updateOperationalCost(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateOperationalCostSchema))
    dto: { operational_cost: number },
  ) {
    return this.sellingReportService.updateOperationalCost(+id, dto.operational_cost);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellingReportService.remove(+id);
  }
}
