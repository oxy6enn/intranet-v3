import { notFound } from "next/navigation";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
import { UserPermissionsForm } from "@/components/admin/user-permissions-form";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";
import { getWorkspaceShellData } from "@/lib/workspace-shell-data";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserPermissionsPage({ params }: Params) {
  const session = await requirePermissionSession(
    PERMISSION_CODES.PERMISSION_MANAGE
  );
  const workspace = await getWorkspaceShellData(session.user);
  const { id } = await params;

  const [user, permissions, assignedPermissions] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.permission.findMany({
      orderBy: {
        code: "asc",
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
      },
    }),
    prisma.userPermission.findMany({
      where: {
        userId: id,
      },
      select: {
        permissionId: true,
      },
    }),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <AdminWorkspaceShell workspace={workspace}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Admin / Users / Direct permissions
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Manage user access
          </h1>
        </div>

        <UserPermissionsForm
          userId={user.id}
          userName={user.name}
          userEmail={user.email}
          permissions={permissions}
          assignedPermissionIds={assignedPermissions.map(
            (item) => item.permissionId
          )}
        />
      </div>
    </AdminWorkspaceShell>
  );
}
