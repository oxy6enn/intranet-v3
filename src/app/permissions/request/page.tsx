import { Badge } from "@/components/ui/badge";
import { PermissionRequestForm } from "@/components/permissions/permission-request-form";
import { requireActiveSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function PermissionRequestPage() {
  const session = await requireActiveSession();

  const [permissions, userPermissions, requestHistory] = await Promise.all([
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
        userId: session.user.id,
      },
      select: {
        permissionId: true,
      },
    }),
    prisma.permissionRequest.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        permission: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const assignedPermissionIds = new Set(
    userPermissions.map((permission) => permission.permissionId)
  );

  const availablePermissions = permissions.filter(
    (permission) => !assignedPermissionIds.has(permission.id)
  );

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <Badge variant="outline">Access / Permission Requests</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Request additional permissions
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Submit a permission request when you need access beyond your current
            role. Administrators can then review and approve or reject it from
            the back office.
          </p>
        </div>

        <PermissionRequestForm
          availablePermissions={availablePermissions}
          requestHistory={requestHistory.map((request) => ({
            id: request.id,
            permissionCode: request.permission.code,
            permissionName: request.permission.name,
            reason: request.reason,
            status: request.status,
            createdAtLabel: request.createdAt.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))}
        />
      </div>
    </main>
  );
}
