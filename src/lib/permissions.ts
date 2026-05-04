import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permission-check";

export { can };

export async function getPermissionCodesByUserId(userId: string) {
  const userPermissions = await prisma.userPermission.findMany({
    where: {
      userId,
    },
    select: {
      permission: {
        select: {
          code: true,
        },
      },
    },
  });

  return userPermissions.map((entry) => entry.permission.code);
}

export async function canByUserId(userId: string, permissionCode: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      permissions: {
        select: {
          permission: {
            select: {
              code: true,
            },
          },
        },
      },
    },
  });

  return can(user, permissionCode);
}
