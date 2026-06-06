import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import { Tables } from '../table/entities/table.entity';
import { Payment } from '../payment/entities/payment.entity';
import OrderStatusEnum from '../order/enums/order-status.enum';

const isPaid = (order: Order) =>
  order.payment?.payment_status === 'settlement';

type ChartPeriod = '7d' | '30d' | '6m';

const ACTIVE_ORDER_STATUSES = [
  OrderStatusEnum.PENDING,
  OrderStatusEnum.PROCESSING,
  OrderStatusEnum.READY,
];

@Injectable()
export class DashboardService {
  constructor(
    private response: ResponseHelper,
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(Menu) private readonly menuModel: typeof Menu,
    @InjectModel(Tables) private readonly tableModel: typeof Tables,
  ) {}

  async getManagerStats() {
    const [menuCount, orderCount, tableCount] = await Promise.all([
      this.menuModel.count(),
      this.orderModel.count(),
      this.tableModel.count(),
    ]);

    return this.response.success(
      { menuCount, orderCount, tableCount },
      200,
      'Successfully retrieved manager dashboard stats',
    );
  }

  async getCashierStats() {
    const [newOrders, processingOrders, totalOrders] = await Promise.all([
      this.orderModel.count({ where: { status: OrderStatusEnum.PENDING } }),
      this.orderModel.count({ where: { status: OrderStatusEnum.PROCESSING } }),
      this.orderModel.count(),
    ]);

    return this.response.success(
      { newOrders, processingOrders, totalOrders },
      200,
      'Successfully retrieved cashier dashboard stats',
    );
  }

  private async findActiveOrders(limit = 10) {
    return this.orderModel.findAll({
      where: { status: { [Op.in]: ACTIVE_ORDER_STATUSES } },
      include: [{ model: OrderItem, include: [Menu] }],
      order: [['created_at', 'DESC']],
      limit,
    });
  }

  async getActiveOrders() {
    try {
      const orders = await this.findActiveOrders();
      return this.response.success(orders, 200, 'Successfully retrieved active orders');
    } catch (error: any) {
      return this.response.fail(error.message, 500);
    }
  }

  async getPendingPayments() {
    try {
      const orders = await this.findActiveOrders();
      return this.response.success(orders, 200, 'Successfully retrieved pending payments');
    } catch (error: any) {
      return this.response.fail(error.message, 500);
    }
  }

  async getManagerChartData(period: string) {
    const validPeriod: ChartPeriod = ['7d', '30d', '6m'].includes(period)
      ? (period as ChartPeriod)
      : '7d';

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    if (validPeriod === '7d') {
      startDate.setDate(startDate.getDate() - 6);
    } else if (validPeriod === '30d') {
      startDate.setDate(startDate.getDate() - 29);
    } else {
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
    }
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.orderModel.findAll({
      where: { created_at: { [Op.between]: [startDate, endDate] } },
      attributes: ['id', 'total_price', 'status', 'created_at'],
      include: [{ model: Payment, attributes: ['payment_status'] }],
    });

    const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    type Bucket = { label: string; count: number; revenue: number; key: string };
    const buckets: Bucket[] = [];

    if (validPeriod === '6m') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        buckets.push({ label: MONTH_NAMES[d.getMonth()], count: 0, revenue: 0, key });
      }
      orders.forEach((order) => {
        const d = new Date(order.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const bucket = buckets.find((b) => b.key === key);
        if (bucket) {
          bucket.count++;
          if (isPaid(order)) {
            bucket.revenue += Number(order.total_price);
          }
        }
      });
    } else {
      const days = validPeriod === '7d' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const label =
          validPeriod === '7d'
            ? DAY_NAMES[d.getDay()]
            : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        buckets.push({ label, count: 0, revenue: 0, key });
      }
      orders.forEach((order) => {
        const d = new Date(order.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const bucket = buckets.find((b) => b.key === key);
        if (bucket) {
          bucket.count++;
          if (isPaid(order)) {
            bucket.revenue += Number(order.total_price);
          }
        }
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= todayStart);

    const totalRevenueInPeriod = orders
      .filter(isPaid)
      .reduce((sum, o) => sum + Number(o.total_price), 0);
    const canceledRevenue = orders
      .filter((o) => Number(o.status) === OrderStatusEnum.CANCELED)
      .reduce((sum, o) => sum + Number(o.total_price), 0);

    return this.response.success(
      {
        orders: {
          chart: buckets.map((b) => ({ label: b.label, count: b.count })),
          totalInPeriod: orders.length,
          todayCount: todayOrders.length,
        },
        revenue: {
          chart: buckets.map((b) => ({ label: b.label, revenue: b.revenue })),
          totalInPeriod: totalRevenueInPeriod,
          todayRevenue: todayOrders
            .filter(isPaid)
            .reduce((sum, o) => sum + Number(o.total_price), 0),
          completed: totalRevenueInPeriod,
          canceled: canceledRevenue,
        },
      },
      200,
      'Successfully retrieved manager chart data',
    );
  }
}
