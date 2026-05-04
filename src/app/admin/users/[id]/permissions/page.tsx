import { notFound } from "next/navigation";
import { UserPermissionsForm } from "@/components/admin/user-permissions-form";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserPermissionsPage({ params }: Params) {
  await requirePermissionSession(PERMISSION_CODES.PERMISSION_MANAGE);
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
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
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
    </main>
  );
}
