import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import routerConfig from './core/configs/router.config';
import { sequelizeConfigAsync } from './core/configs/sequelize.config';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { ResponseModule } from './core/modules/response/response.module';
import { S3Module } from './core/modules/s3/s3.module';
import { AiPredictionModule } from './features/ai-prediction/ai-prediction.module';
import { AuthModule } from './features/auth/auth.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { EnumModule } from './features/enum/enum.module';
import { MenuModule } from './features/menu/menu.module';
import { OrderModule } from './features/order/order.module';
import { PaymentModule } from './features/payment/payment.module';
import { SellingReportModule } from './features/selling-report/selling-report.module';
import { SellingTrendModule } from './features/selling-trend/selling-trend.module';
import { StockModule } from './features/stock/stock.module';
import { TableModule } from './features/table/table.module';
import { UnitModule } from './features/unit/unit.module';
import { UserModule } from './features/user/user.module';

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
    PaymentModule,
    SellingReportModule,
    DashboardModule,
    AiPredictionModule,
    SellingTrendModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
