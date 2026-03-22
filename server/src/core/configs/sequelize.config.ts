import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  SequelizeModuleAsyncOptions,
  SequelizeModuleOptions,
} from '@nestjs/sequelize';
import * as fs from 'fs';
import moment from 'moment';
import * as path from 'path';

export default class SequelizeConfig {
  public static getConfig(
    configService: ConfigService,
  ): SequelizeModuleOptions {
    return {
      dialect: configService.get('DB_DRIVER') || 'mysql',
      host: configService.get('DB_HOST') || 'localhost',
      port: configService.get('DB_PORT') || 3306,
      username: configService.get('DB_USER') || 'root',
      password: configService.get('DB_PASSWORD') || '',
      database: configService.get('DB_NAME') || '',
      logQueryParameters: true,
      logging: (query, model: any) => {
        if (model.type !== 'SELECT') {
          // Define the log file path
          const logFilePath = path.join(
            __dirname,
            '..',
            '..',
            '..',
            'logs',
            'query.log',
          );
          const logDir = path.dirname(logFilePath);

          // Ensure the log directory exists
          if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
          }

          // Ensure the log file exists
          if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '');
          }

          fs.appendFile(
            logFilePath,
            query.replace(
              /Executing \([^)]+\):/g,
              moment().format('Y-MM-DD-HH-mm-ss:'),
            ) + ',\n',
            (err) => {
              if (err) {
                console.error('Failed to write log:', err);
              }
            },
          );
        }
      },
      autoLoadModels: true,
      models: [__dirname + '/**/*.entity{.ts,.js}'],
      modelMatch: (filename, member) => {
        return (
          filename.substring(0, filename.indexOf('.entity')) ===
          member.toLowerCase()
        );
      },
      synchronize: false,
    };
  }
}

export const sequelizeConfigAsync: SequelizeModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (
    configService: ConfigService,
  ): Promise<SequelizeModuleOptions> =>
    SequelizeConfig.getConfig(configService),
  inject: [ConfigService],
};
