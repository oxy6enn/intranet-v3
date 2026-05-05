import { AdminWorkspaceShell } from "@/components/admin/admin-workspace-shell";
import { EmployeeForm } from "@/components/admin/employee-form";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { getWorkspaceShellData } from "@/lib/workspace-shell-data";

export default async function CreateEmployeePage() {
  const session = await requirePermissionSession(PERMISSION_CODES.EMPLOYEE_CREATE);
  const workspace = await getWorkspaceShellData(session.user);

  return (
    <AdminWorkspaceShell workspace={workspace}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Admin / Employees / Create
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Add employee
          </h1>
        </div>

        <EmployeeForm mode="create" />
      </div>
    </AdminWorkspaceShell>
  );
}
