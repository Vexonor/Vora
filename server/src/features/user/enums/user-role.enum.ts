enum UserRoleEnum {
  CASHIER = 0,
  KITCHEN = 1,
  MANAGER = 2,
}

export const getUserRoleEnumLabel = (userRoleEnum: UserRoleEnum) => {
  switch (userRoleEnum) {
    case UserRoleEnum.CASHIER:
      return 'Cashier';
    case UserRoleEnum.KITCHEN:
      return 'Kitchen';
    case UserRoleEnum.MANAGER:
      return 'Manager';
    default:
      return 'Unknown';
  }
};

export const getUserRoleEnums = () => {
  const enums = Object.entries(UserRoleEnum);
  const result: Array<any> = [];

  for (const [_key, value] of enums) {
    if (typeof value === 'number') {
      result.push({
        id: value,
        name: getUserRoleEnumLabel(+value),
      });
    }
  }

  return result;
};

export default UserRoleEnum;
