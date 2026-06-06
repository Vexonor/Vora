import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { AppModule } from './app.module';
import { Handler } from './core/exceptions/handler.exception';
import { Response } from './core/helpers/interceptions/response.interception';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('query parser', 'extended');
  const httpAdapter = app.get(HttpAdapterHost);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const compression = require('compression');
  app.use(compression());
  app.useGlobalFilters(new Handler(httpAdapter));
  app.useGlobalInterceptors(new Response());
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
