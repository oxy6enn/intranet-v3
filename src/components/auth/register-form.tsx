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

const registerSchema = z
  .object({
    name: z.string().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร"),
    email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร")
      .max(128, "รหัสผ่านยาวเกินไป"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "ยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterValues) => {
    setSubmitError(null);

    startTransition(async () => {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        const message = error.message ?? "เกิดข้อผิดพลาดระหว่างสมัครสมาชิก";
        setSubmitError(message);
        toast.error("สมัครสมาชิกไม่สำเร็จ", {
          description: message,
        });
        return;
      }

      toast.success("สมัครสมาชิกสำเร็จ", {
        description: "ระบบกำลังพาคุณไปยังหน้าระบุตัวตนพนักงาน",
      });
      router.replace("/identify");
    });
  };

  return (
    <Card className="w-full max-w-xl border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">สร้างบัญชีผู้ใช้</CardTitle>
        <CardDescription>
          หลังสมัครสำเร็จ บัญชีของคุณจะอยู่ในสถานะ{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">
            pending_identify
          </code>{" "}
          และต้องไปยืนยันตัวตนต่อ
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {submitError ? (
          <Alert variant="destructive">
            <AlertTitle>สมัครสมาชิกไม่สำเร็จ</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">ชื่อที่ใช้แสดง</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="เช่น Anurak"
                  {...form.register("name")}
                />
                <FieldDescription>
                  ชื่อนี้ใช้เป็นชื่อเบื้องต้นในระบบ ก่อนที่ข้อมูลพนักงานจะถูกจับคู่
                </FieldDescription>
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

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
                  autoComplete="new-password"
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  {...form.register("password")}
                />
                <FieldError errors={[form.formState.errors.password]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">ยืนยันรหัสผ่าน</FieldLabel>
              <FieldContent>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  {...form.register("confirmPassword")}
                />
                <FieldError errors={[form.formState.errors.confirmPassword]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button
            type="button"
            size="lg"
            data-testid="register-submit"
            className="h-11 w-full rounded-xl"
            disabled={isPending}
            onClick={() => void form.handleSubmit(onSubmit)()}
          >
            {isPending ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
