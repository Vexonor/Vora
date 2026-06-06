import { PartialType } from '@nestjs/mapped-types';
import { CreateSellingReportDto } from './create-selling-report.dto';

export class UpdateSellingReportDto extends PartialType(CreateSellingReportDto) {}
