import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import * as Joi from 'joi';

@Injectable()
export class JoiValidationParamPipe implements PipeTransform {
  constructor(private schema: Joi.Schema) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      return await this.schema.validateAsync(value, {
        abortEarly: false,
      });
    } catch (error: any) {
      const message = error.details.map((i: { message: any }) => i.message);
      throw new NotFoundException(message);
    }
  }
}
