import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as Joi from 'joi';
import { ErrorCodeEnum } from '../enums/error-code.enum';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.ObjectSchema) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'body' &&
      (!value || Object.keys(value).length === 0)
    ) {
      throw new BadRequestException('Request body tidak boleh kosong.');
    }

    try {
      return await this.schema.validateAsync(value, {
        abortEarly: false,
      });
    } catch (error: any) {
      if (error.details) {
        const firstErrorType = error.details[0]?.type;

        const isCustomError = firstErrorType && !firstErrorType.includes('.');

        const mainErrorCode = isCustomError
          ? firstErrorType
          : ErrorCodeEnum.VALIDATION_ERROR;

        const responsePayload: any = {
          statusCode: 422,
          error: mainErrorCode,
        };

        if (!isCustomError) {
          responsePayload.messages = error.details.map((err: any) => ({
            field: err.context?.key,
            message: err.message,
          }));
        }

        throw new UnprocessableEntityException(responsePayload);
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
}
