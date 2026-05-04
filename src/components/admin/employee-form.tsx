"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from "@/lib/employee-form-schema";
import { cn } from "@/lib/utils";

type EmployeeFormMode = "create" | "edit";

type EmployeeFormValues = {
  employeeCode: string;
  fullName: string;
  position?: string;
  department?: string;
  temporaryPassword?: string;
  tempPasswordExpiresAt?: string;
};

type EmployeeFormProps = {
  mode: EmployeeFormMode;
  employeeId?: string;
  defaultValues?: {
    employeeCode: string;
    fullName: string;
    position?: string | null;
    department?: string | null;
    tempPasswordExpiresAt?: string | null;
  };
};

type EmployeeMutationResponse = {
  message?: string;
};

function makeTemporaryPassword() {
  return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export function EmployeeForm({
  mode,
  employeeId,
  defaultValues,
}: EmployeeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () => (mode === "create" ? createEmployeeSchema : updateEmployeeSchema),
    [mode]
  );

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeCode: defaultValues?.employeeCode ?? "",
      fullName: defaultValues?.fullName ?? "",
      position: defaultValues?.position ?? "",
      department: defaultValues?.department ?? "",
      temporaryPassword: "",
      tempPasswordExpiresAt: defaultValues?.tempPasswordExpiresAt ?? "",
    },
  });

  const onSubmit = (values: EmployeeFormValues) => {
    setSubmitError(null);

    startTransition(async () => {
      const endpoint =
        mode === "create"
          ? "/api/admin/employees"
          : `/api/admin/employees/${employeeId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as EmployeeMutationResponse;

      if (!response.ok) {
        const message = payload.message ?? "ไม่สามารถบันทึกข้อมูลพนักงานได้";
        setSubmitError(message);
        toast.error("บันทึกข้อมูลไม่สำเร็จ", {
          description: message,
        });
        return;
      }

      toast.success(
        mode === "create" ? "สร้างพนักงานสำเร็จ" : "อัปเดตพนักงานสำเร็จ",
        {
          description:
            mode === "create"
              ? "ข้อมูลพนักงานถูกเพิ่มเข้าระบบแล้ว"
              : "ข้อมูลพนักงานถูกอัปเดตแล้ว",
        }
      );

      router.push("/admin/employees");
      router.refresh();
    });
  };

  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">
          {mode === "create" ? "Create employee record" : "Edit employee record"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "เตรียม employee identity สำหรับ flow identify ก่อนที่ผู้ใช้จะมา claim บัญชีด้วยตนเอง"
            : "แก้ไขข้อมูล employee และ reset temporary password ได้จากหน้านี้"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {submitError ? (
          <Alert variant="destructive">
            <AlertTitle>บันทึกข้อมูลไม่สำเร็จ</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="employeeCode">Employee code</FieldLabel>
              <FieldContent>
                <Input id="employeeCode" {...form.register("employeeCode")} />
                <FieldError errors={[form.formState.errors.employeeCode]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <FieldContent>
                <Input id="fullName" {...form.register("fullName")} />
                <FieldError errors={[form.formState.errors.fullName]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="position">Position</FieldLabel>
              <FieldContent>
                <Input id="position" {...form.register("position")} />
                <FieldError errors={[form.formState.errors.position]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="department">Department</FieldLabel>
              <FieldContent>
                <Input id="department" {...form.register("department")} />
                <FieldError errors={[form.formState.errors.department]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="temporaryPassword">
                {mode === "create"
                  ? "Temporary password"
                  : "New temporary password"}
              </FieldLabel>
              <FieldContent>
                <div className="flex gap-3">
                  <Input
                    id="temporaryPassword"
                    type="text"
                    placeholder={
                      mode === "create"
                        ? "กำหนดหรือ generate รหัสผ่านชั่วคราว"
                        : "เว้นว่างได้ถ้าไม่ต้องการ reset"
                    }
                    {...form.register("temporaryPassword")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      form.setValue("temporaryPassword", makeTemporaryPassword(), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  >
                    Generate
                  </Button>
                </div>
                <FieldDescription>
                  {mode === "create"
                    ? "รหัสนี้จะถูก hash ก่อนบันทึกลงฐานข้อมูล"
                    : "ถ้ากรอกค่าใหม่ ระบบจะถือว่าเป็นการ reset temporary password"}
                </FieldDescription>
                <FieldError errors={[form.formState.errors.temporaryPassword]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="tempPasswordExpiresAt">
                Temporary password expiry
              </FieldLabel>
              <FieldContent>
                <Input
                  id="tempPasswordExpiresAt"
                  type="datetime-local"
                  {...form.register("tempPasswordExpiresAt")}
                />
                <FieldDescription>
                  เว้นว่างได้ถ้าไม่ต้องการกำหนดวันหมดอายุ
                </FieldDescription>
                <FieldError
                  errors={[form.formState.errors.tempPasswordExpiresAt]}
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              size="lg"
              data-testid="employee-submit"
              className="rounded-xl"
              disabled={isPending}
            >
              {isPending
                ? "Saving..."
                : mode === "create"
                  ? "Create employee"
                  : "Save changes"}
            </Button>
            <Link
              href="/admin/employees"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl"
              )}
            >
              Back to employees
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
