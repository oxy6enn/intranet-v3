import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { USER_STATUS } from "@/lib/user-status";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.status === USER_STATUS.PENDING_IDENTIFY) {
    redirect("/identify");
  }

  if (session?.user.status === USER_STATUS.ACTIVE) {
    redirect("/dashboard");
  }

  if (session?.user.status === USER_STATUS.SUSPENDED) {
    redirect("/suspended");
  }

  return (
    <AuthShell
      eyebrow="Phase 4 / Login"
      title="เข้าสู่ระบบด้วย email/password ก่อนเสมอ"
      description="ในระบบนี้ social provider ยังไม่ใช่วิธีเข้าใช้งานหลัก ผู้ใช้ทุกคนต้องเริ่มจาก email/password ก่อน แล้วระบบจะค่อยพาไปยัง identify หรือ dashboard ตามสถานะของบัญชี"
      footerText="ถ้ายังไม่มีบัญชีในระบบ"
      footerLinkLabel="ไปหน้าสมัครสมาชิก"
      footerLinkHref="/register"
    >
      <LoginForm />
    </AuthShell>
  );
}
