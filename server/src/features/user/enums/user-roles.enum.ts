enum UserRoleEnum {
  USER = 0,
  ADMIN = 1,
  SUPER_ADMIN = 2
}

export const getUserRoleEnumLabel = (taskStatusEnum: UserRoleEnum) => {
  switch (taskStatusEnum) {
    case UserRoleEnum.USER:
      return "User";
    case UserRoleEnum.ADMIN:
      return "Admin";
    case UserRoleEnum.SUPER_ADMIN:
      return "Super Admin";
    default:
      return "Unknown";
  }
};

export const getUserRoleEnums = () => {
  const enums = Object.entries(UserRoleEnum);
  const result: Array<any> = [];

  for (const [_key, value] of enums) {
    if (typeof value === "number") {
      result.push({
        id: value,
        name: getUserRoleEnumLabel(+value),
      });
    }
  }

  return result;
};

export default UserRoleEnum;
