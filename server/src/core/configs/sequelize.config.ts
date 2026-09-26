import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  SequelizeModuleAsyncOptions,
  SequelizeModuleOptions,
} from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { logMutationQuery } from '../database/query-logger';

const buildSequelizeOptions = (
  configService: ConfigService,
): SequelizeModuleOptions => ({
  dialect: configService.get<Dialect>('DB_DRIVER') || 'mysql',
  host: configService.get<string>('DB_HOST') || 'localhost',
  port: Number(configService.get('DB_PORT')) || 3306,
  username: configService.get<string>('DB_USER') || 'root',
  password: configService.get<string>('DB_PASSWORD') || '',
  database: configService.get<string>('DB_NAME') || '',
  logQueryParameters: true,
  logging: logMutationQuery,
  autoLoadModels: true,
  synchronize: false,
});

export const sequelizeConfigAsync: SequelizeModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: buildSequelizeOptions,
  inject: [ConfigService],
};
