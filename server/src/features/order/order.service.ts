import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import { Tables } from 'src/features/table/entities/table.entity';
import OrderStatusEnum from './enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    @InjectModel(Order) private readonly orderModel: typeof Order,
    @InjectModel(OrderItem) private readonly orderItemModel: typeof OrderItem,
    @InjectModel(Menu) private readonly menuModel: typeof Menu,
    @InjectModel(Tables) private readonly tableModel: typeof Tables,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const table = await this.tableModel.findByPk(createOrderDto.table_id, { transaction });
      if (!table) {
        throw new Error(`Table with ID ${createOrderDto.table_id} not found`);
      }

      let totalOrderPrice = 0;
      const itemsToCreate: any[] = [];

      for (const item of createOrderDto.items) {
        const menu = await this.menuModel.findByPk(item.menu_id, { transaction });
        if (!menu) {
          throw new Error(`Menu with ID ${item.menu_id} not found`);
        }

        const price = menu.price;
        const total_price = price * item.quantity;
        totalOrderPrice += total_price;

        itemsToCreate.push({
          menu_id: item.menu_id,
          quantity: item.quantity,
          price: price,
          total_price: total_price,
        });
      }

      const order = await this.orderModel.create({
        table_id: createOrderDto.table_id,
        total_price: totalOrderPrice,
        status: OrderStatusEnum.PENDING,
      }, { transaction });

      for (const item of itemsToCreate) {
        await this.orderItemModel.create({
          ...item,
          order_id: order.id,
        }, { transaction });
      }

      await transaction.commit();

      const createdOrder = await this.orderModel.findByPk(order.id, {
        include: [{ model: OrderItem, include: [Menu] }]
      });

      return this.response.success(createdOrder, 201, 'Successfully created order');
    } catch (error: any) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async findAll(query: { status?: string; search?: string } = {}) {
    try {
      const whereClause: any = {};

      if (query.status !== undefined && query.status !== '') {
        try {
          const parsed = JSON.parse(query.status);
          if (Array.isArray(parsed) && parsed.length > 0) {
            whereClause.status = { [Op.in]: parsed.map(Number) };
          } else {
            whereClause.status = Number(query.status);
          }
        } catch {
          whereClause.status = Number(query.status);
        }
      }

      if (query.search) {
        const num = parseInt(query.search.replace(/\D/g, ''), 10);
        if (!isNaN(num)) {
          whereClause[Op.or] = [
            { id: num },
            { table_id: num },
          ];
        }
      }

      const orders = await this.orderModel.findAll({
        where: whereClause,
        include: [{ model: OrderItem, include: [Menu] }],
        order: [['created_at', 'DESC']]
      });
      return this.response.success(orders, 200, 'Successfully retrieved all orders');
    } catch (error: any) {
      return this.response.fail(error.message, 500);
    }
  }

  async findOne(id: number) {
    const order = await this.orderModel.findByPk(id, {
      include: [{ model: OrderItem, include: [Menu] }]
    });
    
    if (!order) {
      return this.response.fail(`Order with ID ${id} not found`, 404);
    }
    
    return this.response.success(order, 200, 'Successfully retrieved order');
  }

  async updateStatus(id: number, updateDto: UpdateOrderStatusDto) {
    const order = await this.orderModel.findByPk(id);
    if (!order) {
      return this.response.fail(`Order with ID ${id} not found`, 404);
    }

    try {
      await order.update({ status: updateDto.status });
      return this.response.success(order, 200, 'Successfully updated order status');
    } catch (error: any) {
      return this.response.fail(error.message, 400);
    }
  }
}
