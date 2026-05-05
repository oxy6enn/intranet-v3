import { Badge } from "@/components/ui/badge";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SocialLinkButtons } from "@/components/profile/social-link-buttons";
import { requireActiveSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { SOCIAL_PROVIDERS } from "@/lib/social-providers";
import { getWorkspaceShellData } from "@/lib/workspace-shell-data";

export default async function ProfileSecurityPage() {
  const session = await requireActiveSession();
  const workspace = await getWorkspaceShellData(session.user);

  const linkedAccounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      providerId: {
        in: [SOCIAL_PROVIDERS.GOOGLE, SOCIAL_PROVIDERS.LINE],
      },
    },
    select: {
      providerId: true,
    },
  });

  const linkedProviderIds = new Set(
    linkedAccounts.map((account) => account.providerId)
  );

  const accounts = [
    {
      providerId: SOCIAL_PROVIDERS.GOOGLE,
      label: "Google",
      description:
        "เชื่อมบัญชี Google เพื่อใช้เป็นวิธีเข้าสู่ระบบเสริมหลังจากบัญชี active แล้ว",
      enabled: Boolean(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
      linked: linkedProviderIds.has(SOCIAL_PROVIDERS.GOOGLE),
    },
    {
      providerId: SOCIAL_PROVIDERS.LINE,
      label: "LINE",
      description:
        "เชื่อมบัญชี LINE สำหรับรองรับการเข้าสู่ระบบเสริมในบริบทการใช้งานภายในองค์กร",
      enabled: Boolean(
        process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET
      ),
      linked: linkedProviderIds.has(SOCIAL_PROVIDERS.LINE),
    },
  ];

  return (
    <WorkspaceShell {...workspace}>
      <div className="flex max-w-6xl flex-col gap-6">
        <div className="space-y-2">
          <Badge variant="outline">Phase 9 / Profile Security</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            จัดการวิธีเข้าสู่ระบบเสริม
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Better Auth ทำหน้าที่เป็น login หลักด้วย email/password ก่อน
            จากนั้นเมื่อผู้ใช้ active แล้ว จึงค่อยผูก social provider เพิ่มได้ที่หน้านี้
          </p>
        </div>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">Social providers</CardTitle>
            <CardDescription>
              เชื่อมบัญชีเสริมสำหรับใช้งานภายหลังจากผ่าน identify flow แล้ว
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialLinkButtons accounts={accounts} />
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
