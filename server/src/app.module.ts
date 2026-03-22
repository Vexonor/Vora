import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import routerConfig from './core/configs/router.config';
import { sequelizeConfigAsync } from './core/configs/sequelize.config';
import { ResponseModule } from './core/modules/response/response.module';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { EnumModule } from './features/enum/enum.module';

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
    UserModule, EnumModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
