import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { fn, col, Op, where as seqWhere } from 'sequelize';
import { SellingReport } from './entities/selling-report.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import OrderStatusEnum from '../order/enums/order-status.enum';
import { ResponseHelper } from 'src/core/helpers/response.helper';

@Injectable()
export class SellingReportService {
  private readonly logger = new Logger(SellingReportService.name);

  constructor(
    private response: ResponseHelper,
    @InjectModel(SellingReport) private readonly sellingReportModel: typeof SellingReport,
    @InjectModel(Order) private readonly orderModel: typeof Order,
  ) {}

  async generate(dateStr: string) {
    if (!dateStr) {
      return this.response.fail('Date is required (YYYY-MM-DD)', 400);
    }

    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);

    const orders = await this.orderModel.findAll({
      where: {
        status: OrderStatusEnum.COMPLETED,
        created_at: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{ model: OrderItem, include: [Menu] }],
    });

    let totalTransaction = orders.length;
    let totalItemsSold = 0;
    let unitCost = 0;
    let grossRevenue = 0;

    for (const order of orders) {
      grossRevenue += Number(order.total_price);
      if (order.items) {
        for (const item of order.items) {
          totalItemsSold += Number(item.quantity);
          unitCost += Number(item.menu?.cost || 0) * Number(item.quantity);
        }
      }
    }

    const netProfit = grossRevenue - unitCost;
    const title = `Laporan Penjualan ${dateStr}`;

    // Update if exists, else create
    let report = await this.sellingReportModel.findOne({ where: { date: startDate } });
    
    if (report) {
      await report.update({
        title,
        total_transaction: totalTransaction,
        total_items_sold: totalItemsSold,
        unit_cost: unitCost,
        gross_revenue: grossRevenue,
        net_profit: netProfit,
      });
    } else {
      report = await this.sellingReportModel.create({
        title,
        date: startDate,
        total_transaction: totalTransaction,
        total_items_sold: totalItemsSold,
        unit_cost: unitCost,
        gross_revenue: grossRevenue,
        net_profit: netProfit,
      });
    }

    return this.response.success(report, 201, 'Successfully generated selling report');
  }

  @Cron('0 22 * * *')
  async generateDailyReport() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    this.logger.log(`Auto-generating daily report for ${dateStr}`);
    try {
      await this.generate(dateStr);
      this.logger.log(`Daily report for ${dateStr} generated successfully`);
    } catch (err) {
      this.logger.error(`Failed to auto-generate daily report for ${dateStr}`, err);
    }
  }

  async findAll(query: { q?: string; month?: string; year?: string } = {}) {
    const conditions: any[] = [];

    if (query.q) {
      conditions.push({ title: { [Op.like]: `%${query.q}%` } });
    }

    const year = query.year ? Number(query.year) : null;
    const month = query.month ? Number(query.month) : null;

    if (year && month) {
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const end = new Date(year, month, 0, 23, 59, 59, 999);
      conditions.push({ date: { [Op.between]: [start, end] } });
    } else if (year) {
      const start = new Date(year, 0, 1, 0, 0, 0, 0);
      const end = new Date(year, 11, 31, 23, 59, 59, 999);
      conditions.push({ date: { [Op.between]: [start, end] } });
    } else if (month) {
      conditions.push(seqWhere(fn('MONTH', col('date')), month));
    }

    const where = conditions.length > 0 ? { [Op.and]: conditions } : {};
    const reports = await this.sellingReportModel.findAll({ where, order: [['date', 'DESC']] });
    return this.response.success(reports, 200, 'Successfully fetched all reports');
  }

  async findOne(id: number) {
    const report = await this.sellingReportModel.findByPk(id);
    if (!report) return this.response.fail('Report not found', 404);
    return this.response.success(report, 200, 'Successfully fetched report');
  }

  async remove(id: number) {
    const report = await this.sellingReportModel.findByPk(id);
    if (!report) return this.response.fail('Report not found', 404);
    await report.destroy();
    return this.response.success({}, 200, 'Successfully deleted report');
  }
}
