import * as Joi from "joi";
import { User } from "src/features/user/entities/user.entity";

export const userIdParamSchema = Joi.number()
  .required()
  .external(async (value) => {
    const user = await User.findByPk(value);
    if (!user) {
      throw new Joi.ValidationError(
        "any.invalid-user-id",
        [
          {
            message: "user not found",
            path: ["id"],
            type: "any.invalid-user-id",
            context: {
              key: "id",
              label: "id",
              value,
            },
          },
        ],
        value,
      );
    }

    return user;
  });
