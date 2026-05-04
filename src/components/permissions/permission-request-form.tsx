"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";

type PermissionOption = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

type PermissionRequestItem = {
  id: string;
  permissionCode: string;
  permissionName: string;
  reason: string;
  status: string;
  createdAtLabel: string;
};

type PermissionRequestFormProps = {
  availablePermissions: PermissionOption[];
  requestHistory: PermissionRequestItem[];
};

type CreatePermissionRequestResponse = {
  message?: string;
};

function getPermissionTestId(code: string) {
  return code.replace(/[^a-z0-9-]/gi, "-");
}

export function PermissionRequestForm({
  availablePermissions,
  requestHistory,
}: PermissionRequestFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reasonsByPermissionId, setReasonsByPermissionId] = useState<
    Record<string, string>
  >({});

  const pendingCodes = useMemo(
    () =>
      new Set(
        requestHistory
          .filter((item) => item.status === "pending")
          .map((item) => item.permissionCode)
      ),
    [requestHistory]
  );

  const submitRequest = (permission: PermissionOption) => {
    const reason = reasonsByPermissionId[permission.id]?.trim() ?? "";

    if (!reason) {
      toast.error("Please add a reason", {
        description: "Explain why you need this permission before sending the request.",
      });
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/permissions/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissionId: permission.id,
          reason,
        }),
      });

      const payload =
        (await response.json().catch(() => ({}))) as CreatePermissionRequestResponse;

      if (!response.ok) {
        toast.error("Request failed", {
          description:
            payload.message ?? "We could not submit your permission request.",
        });
        return;
      }

      toast.success("Request submitted", {
        description: `Your request for ${permission.name} was sent to an administrator.`,
      });

      setReasonsByPermissionId((current) => ({
        ...current,
        [permission.id]: "",
      }));
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-4">
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Request extra access</CardTitle>
            <CardDescription>
              Choose one of the available permission codes below and explain why
              you need it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availablePermissions.length ? (
              availablePermissions.map((permission) => {
                const testId = getPermissionTestId(permission.code);
                const hasPending = pendingCodes.has(permission.code);

                return (
                  <article
                    key={permission.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold">{permission.name}</h2>
                          <Badge variant="outline">{permission.code}</Badge>
                          {hasPending ? (
                            <Badge variant="secondary">pending</Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {permission.description ?? "No description provided yet."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <Textarea
                        value={reasonsByPermissionId[permission.id] ?? ""}
                        onChange={(event) =>
                          setReasonsByPermissionId((current) => ({
                            ...current,
                            [permission.id]: event.target.value,
                          }))
                        }
                        placeholder="Describe the business reason or task that requires this permission."
                        data-testid={`permission-request-reason-${testId}`}
                      />
                      <Button
                        type="button"
                        className="rounded-xl"
                        disabled={isPending || hasPending}
                        data-testid={`permission-request-submit-${testId}`}
                        onClick={() => submitRequest(permission)}
                      >
                        {hasPending ? "Already pending" : "Submit request"}
                      </Button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                No additional permission is available to request right now.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-4">
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Request history</CardTitle>
            <CardDescription>
              Track what has already been requested and reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requestHistory.length ? (
              requestHistory.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-border bg-card p-4"
                  data-testid={`permission-request-history-${getPermissionTestId(
                    request.permissionCode
                  )}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{request.permissionName}</p>
                    <Badge variant="outline">{request.permissionCode}</Badge>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {request.reason}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {request.createdAtLabel}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                You have not submitted any permission request yet.
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
