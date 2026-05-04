import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/lib/auth";
import { USER_STATUS } from "@/lib/user-status";

export default async function RegisterPage() {
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
      eyebrow="Phase 4 / Register"
      title="เริ่มต้นด้วยการสร้างบัญชีผู้ใช้ในระบบ"
      description="หน้านี้รับผิดชอบเฉพาะการสมัครด้วย email/password ตาม flow หลักของระบบ หลังจากนั้นผู้ใช้จะถูกพาไปยืนยันตัวตนพนักงานที่หน้า identify"
      footerText="ถ้าคุณต้องการกลับไปทบทวน flow หลักของระบบ"
      footerLinkLabel="ดูเอกสารสรุป"
      footerLinkHref="/"
    >
      <RegisterForm />
    </AuthShell>
  );
}
