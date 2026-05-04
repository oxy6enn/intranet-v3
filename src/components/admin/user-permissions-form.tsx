"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type PermissionOption = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type UserPermissionsFormProps = {
  userId: string;
  userName: string;
  userEmail: string;
  assignedPermissionIds: string[];
  permissions: PermissionOption[];
};

type UpdateUserPermissionsResponse = {
  message?: string;
};

export function UserPermissionsForm({
  userId,
  userName,
  userEmail,
  assignedPermissionIds,
  permissions,
}: UserPermissionsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>(assignedPermissionIds);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const getPermissionCheckboxTestId = (permissionCode: string) =>
    `permission-checkbox-${permissionCode.replace(/[^a-z0-9-]/gi, "-")}`;

  const togglePermission = (permissionId: string, checked: boolean) => {
    setSelectedIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, permissionId]));
      }

      return current.filter((id) => id !== permissionId);
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissionIds: selectedIds,
        }),
      });

      const payload = (await response.json()) as UpdateUserPermissionsResponse;

      if (!response.ok) {
        toast.error("อัปเดตสิทธิ์ไม่สำเร็จ", {
          description:
            payload.message ?? "เกิดข้อผิดพลาดระหว่างบันทึกสิทธิ์",
        });
        return;
      }

      toast.success("อัปเดตสิทธิ์สำเร็จ", {
        description: "สิทธิ์รายคนของผู้ใช้นี้ถูกอัปเดตแล้ว",
      });
      router.refresh();
    });
  };

  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="text-2xl">Assign direct permissions</CardTitle>
          <Badge variant="outline">{userName}</Badge>
        </div>
        <CardDescription>
          {userEmail} | เลือกเฉพาะ permission รายคนที่ต้องการเสริมเพิ่มจาก role หลัก
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldGroup>
          {permissions.length ? (
            permissions.map((permission) => (
              <Field
                key={permission.id}
                orientation="horizontal"
                className="items-start rounded-2xl border border-border bg-card p-4"
              >
                <Checkbox
                  data-testid={getPermissionCheckboxTestId(permission.code)}
                  checked={selectedSet.has(permission.id)}
                  onCheckedChange={(checked) =>
                    togglePermission(permission.id, Boolean(checked))
                  }
                />
                <FieldContent>
                  <FieldLabel>{permission.name}</FieldLabel>
                  <FieldDescription className="space-y-2">
                    <span className="inline-block rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                      {permission.code}
                    </span>
                    <span className="block">
                      {permission.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                    </span>
                  </FieldDescription>
                </FieldContent>
              </Field>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              ยังไม่มี permission ในระบบ กรุณาสร้าง permission ก่อน
            </p>
          )}
        </FieldGroup>

        <Button
          type="button"
          size="lg"
          data-testid="save-user-permissions"
          className="rounded-xl"
          disabled={isPending}
          onClick={handleSave}
        >
          {isPending ? "Saving..." : "Save direct permissions"}
        </Button>
      </CardContent>
    </Card>
  );
}
