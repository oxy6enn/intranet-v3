import Link from "next/link";
import { Building2, KeyRound, Plus, UsersRound } from "lucide-react";
import { EmployeesTable } from "@/components/admin/employees-table";
import { buttonVariants } from "@/components/ui/button";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function AdminEmployeesPage() {
  await requirePermissionSession(PERMISSION_CODES.EMPLOYEE_VIEW);

  const employees = await prisma.employee.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      claimedUser: {
        select: {
          email: true,
        },
      },
    },
  });

  const rows = employees.map((employee) => ({
    id: employee.id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    position: employee.position,
    department: employee.department,
    isClaimed: employee.isClaimed,
    claimedEmail: employee.claimedUser?.email ?? null,
    tempPasswordExpiresAt: employee.tempPasswordExpiresAt?.toISOString() ?? null,
  }));

  const claimedCount = employees.filter((employee) => employee.isClaimed).length;
  const waitingCount = employees.length - claimedCount;
  const departmentCount = new Set(
    employees.map((employee) => employee.department).filter(Boolean)
  ).size;

  const stats = [
    {
      label: "พนักงานทั้งหมด",
      value: employees.length,
      helper: "records available for identify flow",
      icon: UsersRound,
    },
    {
      label: "ถูกผูกบัญชีแล้ว",
      value: claimedCount,
      helper: "employees already claimed by users",
      icon: Building2,
    },
    {
      label: "รอยืนยันตัวตน",
      value: waitingCount,
      helper: "records still waiting to be claimed",
      icon: KeyRound,
    },
    {
      label: "จำนวนหน่วยงาน",
      value: departmentCount,
      helper: "distinct departments in this directory",
      icon: Building2,
    },
  ];

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Admin / Employees
          </p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Employee directory
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                ชุดข้อมูลนี้คือแหล่งอ้างอิงของ identify flow ผู้ใช้จะนำ{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  employee_code
                </code>{" "}
                และ{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  temporary_password
                </code>{" "}
                มาเชื่อมบัญชีกับตัวตนพนักงานจริงจากหน้านี้
              </p>
            </div>

            <Link
              href="/admin/employees/create"
              data-testid="create-employee-link"
              className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
            >
              <Plus className="size-4" />
              Add employee
            </Link>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-4">
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

        <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <EmployeesTable data={rows} />
        </section>
      </div>
    </main>
  );
}
