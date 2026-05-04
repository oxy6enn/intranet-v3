import { USER_ROLE } from "./user-role";

export type PermissionAwareUser = {
  id: string;
  role: string;
  permissions?: Array<{
    permission: {
      code: string;
    };
  }>;
};

export function can(
  user: PermissionAwareUser | null | undefined,
  permissionCode: string
) {
  if (!user) {
    return false;
  }

  if (user.role === USER_ROLE.SUPER_ADMIN) {
    return true;
  }

  return (
    user.permissions?.some(
      (userPermission) => userPermission.permission.code === permissionCode
    ) ?? false
  );
}
