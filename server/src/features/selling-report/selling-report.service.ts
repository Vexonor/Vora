import { Injectable } from '@nestjs/common';
import { CreateSellingReportDto } from './dto/create-selling-report.dto';
import { UpdateSellingReportDto } from './dto/update-selling-report.dto';

@Injectable()
export class SellingReportService {
  create(createSellingReportDto: CreateSellingReportDto) {
    return 'This action adds a new sellingReport';
  }

  findAll() {
    return `This action returns all sellingReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sellingReport`;
  }

  update(id: number, updateSellingReportDto: UpdateSellingReportDto) {
    return `This action updates a #${id} sellingReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} sellingReport`;
  }
}
