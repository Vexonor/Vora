import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private schema: Joi.ObjectSchema) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      await this.schema.validateAsync(value, {
        abortEarly: false,
      });
      return value;
    } catch (error) {
      if (typeof error.details !== 'undefined') {
        const message = error.details.map((err) => err.message).join(', ');
        throw new BadRequestException(message);
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }
}
