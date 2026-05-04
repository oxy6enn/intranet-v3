"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

type SocialAccountItem = {
  providerId: string;
  label: string;
  description: string;
  enabled: boolean;
  linked: boolean;
};

type SocialLinkButtonsProps = {
  accounts: SocialAccountItem[];
};

export function SocialLinkButtons({ accounts }: SocialLinkButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleLink = (provider: string, enabled: boolean) => {
    if (!enabled) {
      toast.info("Provider นี้ยังไม่ถูกเปิดใช้งาน", {
        description:
          "กรุณาใส่ client id / client secret ของ provider นี้ในไฟล์ .env ก่อน",
      });
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.linkSocial({
        provider,
        callbackURL: "/profile/security",
      });

      if (error) {
        toast.error("เริ่มขั้นตอน link ไม่สำเร็จ", {
          description:
            error.message ?? "เกิดข้อผิดพลาดกับ social provider",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <Card key={account.providerId} className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{account.label}</CardTitle>
              {account.linked ? (
                <Badge variant="secondary">Linked</Badge>
              ) : account.enabled ? (
                <Badge variant="outline">Ready</Badge>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
            </div>
            <CardDescription>{account.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant={account.linked ? "outline" : "default"}
              className="rounded-xl"
              disabled={isPending || account.linked}
              onClick={() => handleLink(account.providerId, account.enabled)}
            >
              {account.linked ? "เชื่อมแล้ว" : `Link ${account.label}`}
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card className="rounded-2xl border-dashed border-border shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl">ThaiD</CardTitle>
            <Badge variant="outline">Coming soon</Badge>
          </div>
          <CardDescription>
            เราจะเตรียม ThaiD ผ่าน Generic OAuth / OIDC ใน phase ถัดไปของงาน
            social integration และยังไม่เปิดใช้งานในรอบนี้
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" className="rounded-xl" disabled>
            Link ThaiD
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
