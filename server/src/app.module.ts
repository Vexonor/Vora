import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import routerConfig from './core/configs/router.config';
import { sequelizeConfigAsync } from './core/configs/sequelize.config';
import { ResponseModule } from './core/modules/response/response.module';
import { S3Module } from './core/modules/s3/s3.module';
import { AuthModule } from './features/auth/auth.module';
import { EnumModule } from './features/enum/enum.module';
import { MenuModule } from './features/menu/menu.module';
import { OrderItemModule } from './features/order-item/order-item.module';
import { OrderModule } from './features/order/order.module';
import { PaymentModule } from './features/payment/payment.module';
import { SellingReportModule } from './features/selling-report/selling-report.module';
import { StockModule } from './features/stock/stock.module';
import { TableModule } from './features/table/table.module';
import { UnitModule } from './features/unit/unit.module';
import { UserModule } from './features/user/user.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { AiPredictionModule } from './features/ai-prediction/ai-prediction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    SequelizeModule.forRootAsync(sequelizeConfigAsync),
    routerConfig,
    ResponseModule,
    S3Module,
    AuthModule,
    UserModule,
    EnumModule,
    UnitModule,
    StockModule,
    MenuModule,
    TableModule,
    OrderModule,
    OrderItemModule,
    PaymentModule,
    SellingReportModule,
    DashboardModule,
    AiPredictionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
