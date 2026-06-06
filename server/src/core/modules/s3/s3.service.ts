import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3_CLIENT } from '../../configs/s3.config';
import crypto from 'crypto';
import path from 'path';

export interface S3UploadResult {
  key: string;
  url: string;
}

@Injectable()
export class S3Service {
  private readonly bucketName: string;
  private readonly region: string;

  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
    this.region = this.configService.getOrThrow<string>('AWS_S3_REGION');
  }


  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<S3UploadResult> {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${crypto.randomUUID()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    const url = this.getFileUrl(key);

    return { key, url };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
