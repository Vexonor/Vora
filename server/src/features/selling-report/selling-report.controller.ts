import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SellingReportService } from './selling-report.service';
import { CreateSellingReportDto } from './dto/create-selling-report.dto';
import { UpdateSellingReportDto } from './dto/update-selling-report.dto';

@Controller('selling-report')
export class SellingReportController {
  constructor(private readonly sellingReportService: SellingReportService) {}

  @Post()
  create(@Body() createSellingReportDto: CreateSellingReportDto) {
    return this.sellingReportService.create(createSellingReportDto);
  }

  @Get()
  findAll() {
    return this.sellingReportService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellingReportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSellingReportDto: UpdateSellingReportDto) {
    return this.sellingReportService.update(+id, updateSellingReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellingReportService.remove(+id);
  }
}
