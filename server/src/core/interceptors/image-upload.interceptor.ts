import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_MIME_PATTERN = /\/(jpg|jpeg|png|gif|webp|avif)$/;

export const ImageUploadInterceptor = (fieldName: string) =>
  FileInterceptor(fieldName, {
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: (_request, file, callback) => {
      if (!IMAGE_MIME_PATTERN.test(file.mimetype)) {
        return callback(
          new BadRequestException('Only image files are allowed!'),
          false,
        );
      }
      callback(null, true);
    },
  });
