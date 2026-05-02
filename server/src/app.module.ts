import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import routerConfig from './core/configs/router.config';
import { sequelizeConfigAsync } from './core/configs/sequelize.config';
import { ResponseModule } from './core/modules/response/response.module';
import { AuthModule } from './features/auth/auth.module';
import { EnumModule } from './features/enum/enum.module';
import { MaterialModule } from './features/material/material.module';
import { UnitModule } from './features/unit/unit.module';
import { UserModule } from './features/user/user.module';
import { StockModule } from './features/stock/stock.module';
import { MenuModule } from './features/menu/menu.module';
import { TableModule } from './features/table/table.module';
import { OrderModule } from './features/order/order.module';
import { OrderItemModule } from './features/order-item/order-item.module';
import { PaymentModule } from './features/payment/payment.module';
import { SellingReportModule } from './features/selling-report/selling-report.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
    }),
    SequelizeModule.forRootAsync(sequelizeConfigAsync),
    routerConfig,
    ResponseModule,
    AuthModule,
    UserModule,
    EnumModule,
    UnitModule,
    MaterialModule,
    StockModule,
    MenuModule,
    TableModule,
    OrderModule,
    OrderItemModule,
    PaymentModule,
    SellingReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
