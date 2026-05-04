import Link from "next/link";
import { ShieldBan } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SuspendedPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Card className="rounded-3xl border-red-200 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <ShieldBan className="size-6" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-2xl">บัญชีถูกระงับการใช้งาน</CardTitle>
              <CardDescription>
                ระบบตรวจพบว่าสถานะบัญชีของคุณเป็น{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                  suspended
                </code>{" "}
                จึงไม่อนุญาตให้เข้าถึงหน้าในระบบขณะนี้
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">
              หากนี่ไม่ใช่พฤติกรรมที่คุณคาดไว้ ให้ติดต่อผู้ดูแลระบบเพื่อตรวจสอบสถานะบัญชี
              และสิทธิ์ของผู้ใช้รายนี้
            </p>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
            >
              กลับหน้าแรก
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
