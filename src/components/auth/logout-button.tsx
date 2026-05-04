"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    try {
      await authClient.signOut();
      toast.success("ออกจากระบบแล้ว", {
        description: "คุณสามารถทดสอบเข้าสู่ระบบใหม่ด้วย email/password ได้ทันที",
      });
      router.replace("/login");
      router.refresh();
    } catch {
      toast.error("ออกจากระบบไม่สำเร็จ", {
        description: "กรุณาลองอีกครั้ง",
      });
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      data-testid="logout-button"
      className={className}
      onClick={handleSignOut}
      disabled={isPending}
    >
      <LogOut className="size-4" />
      <span>{isPending ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
    </Button>
  );
}
