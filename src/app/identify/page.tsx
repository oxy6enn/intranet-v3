import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { IdentifyForm } from "@/components/auth/identify-form";
import { auth } from "@/lib/auth";
import { USER_STATUS } from "@/lib/user-status";

export default async function IdentifyPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.status === USER_STATUS.SUSPENDED) {
    redirect("/suspended");
  }

  if (session.user.status === USER_STATUS.ACTIVE) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      eyebrow="Phase 5 / Identify"
      title="ยืนยันว่าบัญชีนี้เป็นพนักงานตัวจริงในหน่วยงาน"
      description="ขั้นตอนนี้แยกออกจาก register/login อย่างตั้งใจ เพื่อไม่ให้ผู้ใช้กรอกข้อมูลพนักงานเองในตอนสมัคร และเพื่อให้ข้อมูลพนักงานมาจากฝั่ง admin เท่านั้น"
      footerText="ถ้ายังไม่ได้รับรหัสพนักงานหรือรหัสผ่านชั่วคราว"
      footerLinkLabel="กลับไปหน้า Login"
      footerLinkHref="/login"
    >
      <IdentifyForm email={session.user.email} />
    </AuthShell>
  );
}
