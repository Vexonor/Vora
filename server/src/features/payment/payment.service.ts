import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { ResponseHelper } from 'src/core/helpers/response.helper';
import { Payment } from './entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { OrderItem } from '../order-item/entities/order-item.entity';
import { Menu } from '../menu/entities/menu.entity';
import PaymentTypeEnum from './enums/payment-type.enum';
import OrderStatusEnum from '../order/enums/order-status.enum';
import * as crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const midtransClient = require('midtrans-client');

@Injectable()
export class PaymentService {
  private snap: any;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private response: ResponseHelper,
    private sequelize: Sequelize,
    private configService: ConfigService,
    @InjectModel(Payment) private readonly paymentModel: typeof Payment,
    @InjectModel(Order) private readonly orderModel: typeof Order,
  ) {
    this.snap = new midtransClient.Snap({
      isProduction: this.configService.get<string>('MIDTRANS_IS_PRODUCTION') === 'true',
      serverKey: this.configService.getOrThrow<string>('MIDTRANS_SERVER_KEY'),
      clientKey: this.configService.getOrThrow<string>('MIDTRANS_CLIENT_KEY'),
    });
  }

  async createSnapTransaction(orderId: number, paymentMethod?: string, returnUrl?: string) {
    const order = await this.orderModel.findByPk(orderId, {
      include: [{ model: OrderItem, include: [Menu] }],
    });

    if (!order) {
      return this.response.fail(`Order with ID ${orderId} not found`, 404);
    }

    if (order.status === OrderStatusEnum.COMPLETED || order.status === OrderStatusEnum.CANCELED) {
      return this.response.fail('Order cannot be paid in current status', 400);
    }

    const parameter: any = {
      transaction_details: {
        order_id: `VORA-ORDER-${order.id}-${Date.now()}`,
        gross_amount: Math.round(order.total_price),
      },
      enabled_payments: paymentMethod ? [paymentMethod] : ['qris', 'gopay', 'shopeepay', 'other_qris'],
      item_details: order.items?.map(item => ({
        id: item.menu_id.toString(),
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.menu?.name || 'Menu Item',
      })) || [],
    };

    if (returnUrl) {
      parameter.callbacks = {
        finish: returnUrl,
        error: returnUrl,
        pending: returnUrl,
      };
    }

    try {
      const snapResponse = await this.snap.createTransaction(parameter);

      const payment = await this.paymentModel.create({
        order_id: order.id,
        midtrans_transaction_id: parameter.transaction_details.order_id,
        total: order.total_price,
        paid: 0,
        type: PaymentTypeEnum.ONLINE,
        payment_status: 'pending',
        snap_token: snapResponse.token,
        snap_redirect_url: snapResponse.redirect_url,
      });

      return this.response.success({
        payment_id: payment.id,
        token: snapResponse.token,
        redirect_url: snapResponse.redirect_url,
      }, 201, 'Successfully generated Snap Token');
    } catch (error: any) {
      this.logger.error('Failed to create Midtrans transaction:', error);
      return this.response.fail(error.message, 400);
    }
  }

  async getPaymentByOrderId(orderId: number) {
    const payment = await this.paymentModel.findOne({
      where: { order_id: orderId },
    });

    if (!payment) {
      return this.response.fail(`Payment for order ${orderId} not found`, 404);
    }

    return this.response.success(payment, 200, 'Successfully retrieved payment');
  }

  async verifyOfflinePayment(orderId: number, paidAmount: number) {
    const order = await this.orderModel.findByPk(orderId);

    if (!order) {
      return this.response.fail(`Order with ID ${orderId} not found`, 404);
    }

    if (order.status === OrderStatusEnum.COMPLETED || order.status === OrderStatusEnum.CANCELED) {
      return this.response.fail('Order cannot be verified in current status', 400);
    }

    const transaction = await this.sequelize.transaction();
    try {
      const existingPayment = await this.paymentModel.findOne({ where: { order_id: orderId }, transaction });

      if (!existingPayment) {
        await this.paymentModel.create({
          order_id: orderId,
          total: order.total_price,
          paid: paidAmount,
          type: PaymentTypeEnum.OFFLINE,
          payment_status: 'settlement',
        }, { transaction });
      } else {
        await existingPayment.update({ paid: paidAmount, payment_status: 'settlement' }, { transaction });
      }

      await order.update({ status: OrderStatusEnum.COMPLETED }, { transaction });
      await transaction.commit();

      return this.response.success({}, 200, 'Payment verified successfully');
    } catch (error: any) {
      await transaction.rollback();
      return this.response.fail(error.message, 400);
    }
  }

  async handleWebhook(payload: any) {
    const serverKey = this.configService.getOrThrow<string>('MIDTRANS_SERVER_KEY');

    const hash = crypto.createHash('sha512');
    hash.update(payload.order_id + payload.status_code + payload.gross_amount + serverKey);
    const signatureKey = hash.digest('hex');

    if (signatureKey !== payload.signature_key) {
      this.logger.warn('Invalid signature key from Midtrans webhook');
      // Midtrans expects 200 OK for URL validation tests.
      return this.response.success({}, 200, 'Webhook received but signature invalid');
    }

    const transactionStatus = payload.transaction_status;
    const fraudStatus = payload.fraud_status;

    const payment = await this.paymentModel.findOne({
      where: { midtrans_transaction_id: payload.order_id },
    });

    if (!payment) {
      return this.response.fail('Payment not found', 404);
    }

    const order = await this.orderModel.findByPk(payment.order_id);

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        await payment.update({ payment_status: 'settlement', paid: payment.total });
        if (order) {
          await order.update({ status: OrderStatusEnum.COMPLETED });
        }
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      await payment.update({ payment_status: transactionStatus });
    } else if (transactionStatus === 'pending') {
      await payment.update({ payment_status: 'pending' });
    }

    return this.response.success({}, 200, 'Webhook processed successfully');
  }
}
