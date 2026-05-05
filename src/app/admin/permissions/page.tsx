import { KeySquare, ShieldCheck, UsersRound } from "lucide-react";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
import { PermissionForm } from "@/components/admin/permission-form";
import { PermissionsTable } from "@/components/admin/permissions-table";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";
import { getWorkspaceShellData } from "@/lib/workspace-shell-data";

export default async function AdminPermissionsPage() {
  const session = await requirePermissionSession(
    PERMISSION_CODES.PERMISSION_MANAGE
  );
  const workspace = await getWorkspaceShellData(session.user);

  const permissions = await prisma.permission.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });

  const rows = permissions.map((permission) => ({
    id: permission.id,
    code: permission.code,
    name: permission.name,
    description: permission.description,
    assignedUsers: permission.users.length,
  }));

  const assignedPermissionsCount = permissions.filter(
    (permission) => permission.users.length > 0
  ).length;
  const totalAssignments = permissions.reduce(
    (sum, permission) => sum + permission.users.length,
    0
  );

  const stats = [
    {
      label: "Total permissions",
      value: permissions.length,
      helper: "available permission codes",
      icon: ShieldCheck,
    },
    {
      label: "Assigned permissions",
      value: assignedPermissionsCount,
      helper: "permissions linked to at least one user",
      icon: KeySquare,
    },
    {
      label: "Direct assignments",
      value: totalAssignments,
      helper: "total user-to-permission relationships",
      icon: UsersRound,
    },
  ];

  return (
    <AdminWorkspaceShell workspace={workspace}>
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Admin / Permissions
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Permission catalog
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Manage the central permission codes used by roles, direct user
              assignments, request approvals, and reporting across the system.
            </p>
          </div>

          <section className="grid gap-4 md:grid-cols-3">
            {stats.map(({ label, value, helper, icon: Icon }) => (
              <article
                key={label}
                className="rounded-3xl border border-border bg-background p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight">
                      {value}
                    </p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                    <Icon className="size-4" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{helper}</p>
              </article>
            ))}
          </section>

          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <PermissionsTable data={rows} />
          </div>
        </section>

        <PermissionForm />
      </div>
    </AdminWorkspaceShell>
  );
}
