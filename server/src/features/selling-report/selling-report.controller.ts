import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SellingReportService } from './selling-report.service';
import { CreateSellingReportDto } from './dto/create-selling-report.dto';
import { UpdateSellingReportDto } from './dto/update-selling-report.dto';

@Controller()
export class SellingReportController {
  constructor(private readonly sellingReportService: SellingReportService) {}

  @Post('generate')
  generate(@Body('date') date: string) {
    return this.sellingReportService.generate(date);
  }

  @Get()
  findAll(@Query() query: { q?: string; month?: string; year?: string }) {
    return this.sellingReportService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellingReportService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellingReportService.remove(+id);
  }
}
