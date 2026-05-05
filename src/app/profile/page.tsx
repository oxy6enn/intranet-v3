import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireActiveSession } from "@/lib/auth-guards";
import { cn } from "@/lib/utils";
import { getWorkspaceShellData } from "@/lib/workspace-shell-data";

export default async function ProfilePage() {
  const session = await requireActiveSession();
  const workspace = await getWorkspaceShellData(session.user);

  return (
    <WorkspaceShell {...workspace}>
      <div className="max-w-5xl space-y-6">
        <div className="space-y-2">
          <Badge variant="outline">Phase 9 / Profile</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            โปรไฟล์ของผู้ใช้
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            หน้านี้เป็นจุดรวมข้อมูลบัญชีเบื้องต้น และเชื่อมไปยังส่วน security
            สำหรับ social linking
          </p>
        </div>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Account summary</CardTitle>
            <CardDescription>
              ตรวจสอบข้อมูลบัญชีที่ใช้งานอยู่ในระบบตอนนี้
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 text-sm">
              <p>
                <span className="font-medium text-foreground">ชื่อ:</span>{" "}
                {session.user.name}
              </p>
              <p className="mt-2 break-all">
                <span className="font-medium text-foreground">อีเมล:</span>{" "}
                {session.user.email}
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">Role:</span>{" "}
                {session.user.role}
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">Status:</span>{" "}
                {session.user.status}
              </p>
            </div>

            <Link
              href="/profile/security"
              className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}
            >
              ไปหน้า Security
            </Link>
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
