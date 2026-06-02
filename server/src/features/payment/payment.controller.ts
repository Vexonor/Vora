import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':orderId/snap')
  createSnapTransaction(
    @Param('orderId') orderId: string,
    @Body('payment_method') paymentMethod?: string,
    @Body('return_url') returnUrl?: string,
  ) {
    return this.paymentService.createSnapTransaction(+orderId, paymentMethod, returnUrl);
  }

  @Get('order/:orderId')
  getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.getPaymentByOrderId(+orderId);
  }

  @Post('order/:orderId/verify-offline')
  verifyOfflinePayment(
    @Param('orderId') orderId: string,
    @Body('paid_amount') paidAmount: number,
  ) {
    return this.paymentService.verifyOfflinePayment(+orderId, paidAmount);
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(@Body() payload: any) {
    return this.paymentService.handleWebhook(payload);
  }

  @Get('webhook')
  webhookHealthCheck() {
    return { statusCode: 200, message: 'Webhook endpoint is active' };
  }
}
