import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const testAccounts = [
  {
    label: "Active user",
    email: "e2e-auth-flow@example.com",
    password: "E2EPass123!",
    status: "active",
    notes: "ผู้ใช้ทั่วไปสำหรับลอง login, dashboard, profile",
  },
  {
    label: "Active non-admin",
    email: "e2e-non-admin@example.com",
    password: "E2ENonAdmin123!",
    status: "active",
    notes: "ใช้ลอง access control ว่าเข้า /admin ไม่ได้",
  },
  {
    label: "Pending identify",
    email: "e2e-pending-user@example.com",
    password: "E2EPending123!",
    status: "pending_identify",
    notes: "ใช้ลอง flow ที่ login แล้วถูกพาไป /identify",
  },
  {
    label: "Suspended user",
    email: "e2e-suspended-user@example.com",
    password: "E2ESuspended123!",
    status: "suspended",
    notes: "ใช้ลอง flow ที่ถูก redirect ไป /suspended",
  },
  {
    label: "Super admin",
    email: "e2e-admin-flow@example.com",
    password: "E2EAdminPass123!",
    status: "super_admin",
    notes: "admin พื้นฐานสำหรับลองหน้า admin และ dashboard ฝั่ง admin",
  },
  {
    label: "Permission admin",
    email: "e2e-permission-admin@example.com",
    password: "E2EPermissionPass123!",
    status: "super_admin",
    notes: "ใช้ลอง create permission และ permission management",
  },
  {
    label: "Request admin",
    email: "e2e-request-admin@example.com",
    password: "E2ERequestAdmin123!",
    status: "super_admin",
    notes: "ใช้ลอง review permission requests และ notifications ฝั่ง admin",
  },
  {
    label: "Reports admin",
    email: "e2e-reports-admin@example.com",
    password: "E2EReportsAdmin123!",
    status: "super_admin",
    notes: "ใช้ลองหน้า /admin/reports และ export/reporting",
  },
];

export function LoginTestAccounts() {
  return (
    <Card className="w-full max-w-xl border-dashed border-border/70 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-xl">บัญชีทดสอบระบบ</CardTitle>
        <CardDescription>
          ใช้สำหรับลองแต่ละสิทธิ์และสถานะของระบบได้ทันที ถ้าบัญชีใดเข้าไม่ได้
          ให้รันชุด e2e หรือรีเซ็ตข้อมูลทดสอบก่อน
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {testAccounts.map((account) => (
          <div
            key={account.email}
            className="rounded-2xl border border-border bg-card px-4 py-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{account.label}</p>
              <Badge variant="secondary">{account.status}</Badge>
            </div>
            <div className="mt-3 space-y-1 font-mono text-sm">
              <p className="break-all">{account.email}</p>
              <p>{account.password}</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{account.notes}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
