import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage() {
  await requirePermissionSession(PERMISSION_CODES.PERMISSION_MANAGE);

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      permissions: {
        include: {
          permission: {
            select: {
              code: true,
            },
          },
        },
      },
    },
  });

  const activeCount = users.filter((user) => user.status === "active").length;
  const usersWithDirectPermissions = users.filter(
    (user) => user.permissions.length > 0
  ).length;
  const totalDirectAssignments = users.reduce(
    (sum, user) => sum + user.permissions.length,
    0
  );

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Admin / Users
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Direct user permissions
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            หน้านี้ใช้เสริมสิทธิ์เฉพาะรายคนผ่าน{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
              UserPermission
            </code>{" "}
            โดยไม่ต้องเปลี่ยน role หลักของบัญชีนั้น
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">ผู้ใช้ทั้งหมด</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {users.length}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              accounts available in the system
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">ผู้ใช้ที่ active</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {activeCount}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              users ready to access internal routes
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Direct assignments</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {totalDirectAssignments}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {usersWithDirectPermissions} users have extra direct permissions
            </p>
          </article>
        </section>

        <section className="overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-sm">
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Direct permissions</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="bg-background">
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.status}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {user.permissions.length ? (
                        <div className="flex flex-wrap gap-2">
                          {user.permissions.map((item) => (
                            <Badge key={item.permission.code} variant="outline">
                              {item.permission.code}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/users/${user.id}/permissions`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "rounded-lg"
                        )}
                      >
                        จัดสิทธิ์
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </main>
  );
}
