import { NotFoundException } from '@nestjs/common';
import { FindOptions } from 'sequelize';
import { Model, ModelCtor } from 'sequelize-typescript';

export const findByPkOrFail = async <M extends Model>(
  model: ModelCtor<M>,
  id: number,
  notFoundMessage: string | string[],
  options?: Omit<FindOptions<M>, 'where'>,
): Promise<M> => {
  const record = await model.findByPk(id, options);
  if (!record) throw new NotFoundException(notFoundMessage);
  return record;
};
