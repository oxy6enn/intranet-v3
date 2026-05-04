"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginValues) => {
    setSubmitError(null);

    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        const message = error.message ?? "เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ";
        setSubmitError(message);
        toast.error("เข้าสู่ระบบไม่สำเร็จ", {
          description: message,
        });
        return;
      }

      toast.success("เข้าสู่ระบบสำเร็จ", {
        description: "ระบบจะพาคุณไปยังขั้นตอนถัดไป",
      });
      router.replace("/identify");
    });
  };

  return (
    <Card className="w-full max-w-xl border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
        <CardDescription>
          ใช้ email/password เพื่อเข้าสู่ระบบก่อน แล้วค่อยไปยืนยันตัวตนพนักงาน
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {submitError ? (
          <Alert variant="destructive">
            <AlertTitle>เข้าสู่ระบบไม่สำเร็จ</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">อีเมล</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@organization.go.th"
                  {...form.register("email")}
                />
                <FieldError errors={[form.formState.errors.email]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="กรอกรหัสผ่าน"
                  {...form.register("password")}
                />
                <FieldDescription>
                  หากบัญชียังไม่ active ระบบจะพาคุณไปหน้า identify ต่อ
                </FieldDescription>
                <FieldError errors={[form.formState.errors.password]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button
            type="button"
            size="lg"
            data-testid="login-submit"
            className="h-11 w-full rounded-xl"
            disabled={isPending}
            onClick={() => void form.handleSubmit(onSubmit)()}
          >
            {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
