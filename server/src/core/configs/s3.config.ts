import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export const createS3Client = (configService: ConfigService): S3Client => {
  return new S3Client({
    region: configService.getOrThrow<string>('AWS_S3_REGION'),
    credentials: {
      accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
    },
  });
};

export const S3_CLIENT = 'S3_CLIENT';
