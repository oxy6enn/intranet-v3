"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { permissionSchema } from "@/lib/permission-form-schema";

type PermissionMutationResponse = {
  message?: string;
};

type PermissionFormValues = {
  code: string;
  name: string;
  description?: string;
};

export function PermissionForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  const onSubmit = (values: PermissionFormValues) => {
    setSubmitError(null);

    startTransition(async () => {
      const response = await fetch("/api/admin/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json()) as PermissionMutationResponse;

      if (!response.ok) {
        const message = payload.message ?? "ไม่สามารถสร้าง permission ได้";
        setSubmitError(message);
        toast.error("สร้าง permission ไม่สำเร็จ", {
          description: message,
        });
        return;
      }

      toast.success("สร้าง permission สำเร็จ", {
        description: "permission ใหม่พร้อมใช้งานแล้ว",
      });
      form.reset();
      router.refresh();
    });
  };

  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">Create permission</CardTitle>
        <CardDescription>
          ใช้ code กลางสำหรับระบบ authorization เช่น{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
            employee:create
          </code>{" "}
          หรือ{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
            report:view
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {submitError ? (
          <Alert variant="destructive">
            <AlertTitle>สร้าง permission ไม่สำเร็จ</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="code">Permission code</FieldLabel>
              <FieldContent>
                <Input
                  id="code"
                  placeholder="employee:create"
                  {...form.register("code")}
                />
                <FieldDescription>
                  อ้างอิงผ่าน helper เช่น{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                    can(user, &quot;employee:create&quot;)
                  </code>
                </FieldDescription>
                <FieldError errors={[form.formState.errors.code]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Display name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="Create employee records"
                  {...form.register("name")}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <FieldContent>
                <Input
                  id="description"
                  placeholder="อธิบายว่าผู้ใช้จะทำอะไรได้เมื่อมี permission นี้"
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </FieldContent>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            size="lg"
            data-testid="permission-submit"
            className="rounded-xl"
            disabled={isPending}
          >
            {isPending ? "Creating..." : "Create permission"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
