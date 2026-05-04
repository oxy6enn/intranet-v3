import { EmployeeForm } from "@/components/admin/employee-form";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_CODES } from "@/lib/permission-codes";

export default async function CreateEmployeePage() {
  await requirePermissionSession(PERMISSION_CODES.EMPLOYEE_CREATE);

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
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
    </main>
  );
}
