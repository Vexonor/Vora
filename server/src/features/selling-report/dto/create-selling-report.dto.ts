export class CreateSellingReportDto {
  title: string;
  date: string;
  total_transaction: number;
  total_items_sold: number;
  unit_cost: number;
  operational_cost: number;
  gross_revenue: number;
}
