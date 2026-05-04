import { KeySquare, ShieldCheck, UsersRound } from "lucide-react";
import { PermissionForm } from "@/components/admin/permission-form";
import { PermissionsTable } from "@/components/admin/permissions-table";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";

export default async function AdminPermissionsPage() {
  await requirePermissionSession(PERMISSION_CODES.PERMISSION_MANAGE);

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
      label: "Permissions ทั้งหมด",
      value: permissions.length,
      helper: "available permission codes",
      icon: ShieldCheck,
    },
    {
      label: "ถูกใช้งานแล้ว",
      value: assignedPermissionsCount,
      helper: "permissions linked to at least one user",
      icon: KeySquare,
    },
    {
      label: "จำนวนการ assign",
      value: totalAssignments,
      helper: "total direct user-permission relationships",
      icon: UsersRound,
    },
  ];

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
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
              ใช้เก็บ code กลางของระบบ authorization เพื่อให้ role และ direct
              permissions อ้างอิงชุดคำสั่งเดียวกันอย่างเป็นระบบ
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
    </main>
  );
}
