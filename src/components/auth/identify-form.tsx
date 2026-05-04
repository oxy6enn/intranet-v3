"use client";

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

const identifySchema = z.object({
  employee_code: z
    .string()
    .min(2, "กรุณากรอกรหัสพนักงาน")
    .max(50, "รหัสพนักงานยาวเกินไป"),
  temporary_password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่านชั่วคราว"),
});

type IdentifyValues = z.infer<typeof identifySchema>;

type IdentifyResponse = {
  error?: string;
  message?: string;
};

type IdentifyFormProps = {
  email?: string | null;
};

export function IdentifyForm({ email }: IdentifyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<IdentifyValues>({
    resolver: zodResolver(identifySchema),
    defaultValues: {
      employee_code: "",
      temporary_password: "",
    },
  });

  const onSubmit = (values: IdentifyValues) => {
    setSubmitError(null);

    startTransition(async () => {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as IdentifyResponse;

      if (!response.ok) {
        const message =
          payload.message ?? "เกิดข้อผิดพลาดระหว่างยืนยันตัวตนพนักงาน";
        setSubmitError(message);
        toast.error("ยืนยันตัวตนไม่สำเร็จ", {
          description: message,
        });
        return;
      }

      toast.success("ยืนยันตัวตนสำเร็จ", {
        description: "บัญชีของคุณพร้อมใช้งานแล้ว",
      });
      router.replace("/dashboard");
      router.refresh();
    });
  };

  return (
    <Card className="w-full max-w-xl border-border/60 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">ยืนยันตัวตนพนักงาน</CardTitle>
        <CardDescription>
          กรอกรหัสพนักงานและรหัสผ่านชั่วคราวที่ admin ออกให้ เพื่อเปลี่ยนสถานะจาก{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">
            pending_identify
          </code>{" "}
          ไปเป็น{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 text-foreground">
            active
          </code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle>กำลังยืนยันตัวตนของบัญชีนี้</AlertTitle>
          <AlertDescription className="break-all">
            {email ?? "ไม่พบอีเมลของ session ปัจจุบัน"}
          </AlertDescription>
        </Alert>

        {submitError ? (
          <Alert variant="destructive">
            <AlertTitle>ยืนยันตัวตนไม่สำเร็จ</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="employee_code">รหัสพนักงาน</FieldLabel>
              <FieldContent>
                <Input
                  id="employee_code"
                  autoComplete="off"
                  placeholder="เช่น EMP001"
                  {...form.register("employee_code")}
                />
                <FieldDescription>
                  รหัสนี้ต้องตรงกับข้อมูลที่ถูกเตรียมไว้ในตาราง Employee
                </FieldDescription>
                <FieldError errors={[form.formState.errors.employee_code]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="temporary_password">
                รหัสผ่านชั่วคราว
              </FieldLabel>
              <FieldContent>
                <Input
                  id="temporary_password"
                  type="password"
                  autoComplete="one-time-code"
                  placeholder="กรอกรหัสผ่านชั่วคราว"
                  {...form.register("temporary_password")}
                />
                <FieldDescription>
                  ระบบจะตรวจ hash, สถานะการ claim และวันหมดอายุก่อน activate
                </FieldDescription>
                <FieldError
                  errors={[form.formState.errors.temporary_password]}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button
            type="button"
            size="lg"
            data-testid="identify-submit"
            className="h-11 w-full rounded-xl"
            disabled={isPending}
            onClick={() => void form.handleSubmit(onSubmit)()}
          >
            {isPending ? "กำลังยืนยันตัวตน..." : "ยืนยันตัวตน"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
