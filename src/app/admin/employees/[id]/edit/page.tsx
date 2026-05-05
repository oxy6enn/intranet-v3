import { notFound } from "next/navigation";
import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
import { EmployeeForm } from "@/components/admin/employee-form";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";
import { getWorkspaceShellData } from "@/lib/workspace-shell-data";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function toDatetimeLocal(value: Date | null) {
  if (!value) {
    return null;
  }

  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function EditEmployeePage({ params }: Params) {
  const session = await requirePermissionSession(PERMISSION_CODES.EMPLOYEE_UPDATE);
  const workspace = await getWorkspaceShellData(session.user);
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  if (!employee) {
    notFound();
  }

  return (
    <AdminWorkspaceShell workspace={workspace}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Admin / Employees / Edit
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Edit employee
          </h1>
        </div>

        <EmployeeForm
          mode="edit"
          employeeId={employee.id}
          defaultValues={{
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
            position: employee.position,
            department: employee.department,
            tempPasswordExpiresAt: toDatetimeLocal(employee.tempPasswordExpiresAt),
          }}
        />
      </div>
    </AdminWorkspaceShell>
  );
}
