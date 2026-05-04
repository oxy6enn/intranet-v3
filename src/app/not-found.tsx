import Link from "next/link";
import { FileSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <Card className="w-full rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileSearch className="size-6" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl">ไม่พบหน้าที่ต้องการ</CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-7">
                URL นี้อาจไม่ถูกต้อง หน้านี้อาจถูกย้าย หรือคุณอาจเข้ามาจากลิงก์ที่หมดอายุแล้ว
                ลองกลับไปยังหน้าหลักหรือเข้าสู่ dashboard จากเมนูที่รู้จักแทน
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/" className={cn(buttonVariants({ size: "lg" }), "rounded-xl")}>
              กลับหน้าแรก
            </Link>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl"
              )}
            >
              ไปที่ Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
