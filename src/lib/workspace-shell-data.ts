import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/user-role";

type WorkspaceUserInput = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
};

export type WorkspaceShellData = {
  name: string;
  email: string;
  status: string;
  role: string;
  pendingRequestCount: number;
  notificationCount: number;
  isAdmin: boolean;
};

export async function getWorkspaceShellData(
  user: WorkspaceUserInput
): Promise<WorkspaceShellData> {
  const isAdmin = isAdminRole(user.role);

  const [pendingRequestCount, notificationCount] = await Promise.all([
    prisma.permissionRequest.count({
      where: {
        userId: user.id,
        status: PERMISSION_REQUEST_STATUS.PENDING,
      },
    }),
    isAdmin
      ? prisma.permissionRequest.count({
          where: {
            status: PERMISSION_REQUEST_STATUS.PENDING,
          },
        })
      : prisma.permissionRequest.count({
          where: {
            userId: user.id,
          },
        }),
  ]);

  return {
    name: user.name,
    email: user.email,
    status: user.status,
    role: user.role,
    pendingRequestCount,
    notificationCount,
    isAdmin,
  };
}
