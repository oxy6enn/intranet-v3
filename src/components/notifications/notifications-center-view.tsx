"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Bell, Clock3, Search, ShieldCheck, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants, Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { cn } from "@/lib/utils";
import type { WorkspaceShellData } from "@/lib/workspace-shell-data";

type UserRequestUpdateItem = {
  id: string;
  status: string;
  reason: string;
  reviewNote: string | null;
  updatedAtLabel: string;
  permissionCode: string;
  permissionName: string;
  reviewerName: string | null;
};

type AdminReviewQueueItem = {
  id: string;
  reason: string;
  createdAtLabel: string;
  permissionCode: string;
  permissionName: string;
  userName: string;
  userEmail: string;
};

type LatestReviewedItem = {
  id: string;
  status: string;
  reviewedAtLabel: string | null;
  permissionCode: string;
  userName: string;
  reviewerName: string | null;
};

type NotificationsCenterViewProps = {
  workspace: WorkspaceShellData;
  isAdmin: boolean;
  userRequestUpdates: UserRequestUpdateItem[];
  adminReviewQueue: AdminReviewQueueItem[];
  latestReviewedItems: LatestReviewedItem[];
};

type NotificationScope = "all" | "updates" | "queue" | "reviews";

export function NotificationsCenterView({
  workspace,
  isAdmin,
  userRequestUpdates,
  adminReviewQueue,
  latestReviewedItems,
}: NotificationsCenterViewProps) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<NotificationScope>("all");
  const deferredQuery = useDeferredValue(query);

  const filteredUserUpdates = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return userRequestUpdates.filter((item) => {
      if (scope !== "all" && scope !== "updates") {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        item.permissionCode,
        item.permissionName,
        item.reason,
        item.reviewNote ?? "",
        item.reviewerName ?? "",
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [deferredQuery, scope, userRequestUpdates]);

  const filteredAdminQueue = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return adminReviewQueue.filter((item) => {
      if (scope !== "all" && scope !== "queue") {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        item.userName,
        item.userEmail,
        item.permissionCode,
        item.permissionName,
        item.reason,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [adminReviewQueue, deferredQuery, scope]);

  const filteredReviewedItems = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return latestReviewedItems.filter((item) => {
      if (scope !== "all" && scope !== "reviews") {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        item.userName,
        item.permissionCode,
        item.reviewerName ?? "",
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [deferredQuery, latestReviewedItems, scope]);

  const visibleNotificationCount =
    filteredUserUpdates.length +
    (isAdmin ? filteredAdminQueue.length + filteredReviewedItems.length : 0);

  return (
    <WorkspaceShell {...workspace}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge variant="outline">Workspace / Notifications</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Notification center
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            A live summary of request updates, review actions, and the next items
            that need attention in the current workflow.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Visible items</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {visibleNotificationCount}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              notifications matching the current search and scope
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Your updates</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {filteredUserUpdates.length}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              permission request updates for this account
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Pending queue" : "Admin review visibility"}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {isAdmin ? filteredAdminQueue.length : 0}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {isAdmin
                ? "requests that still need an admin decision"
                : "available after admin role is granted"}
            </p>
          </article>
        </section>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle className="text-2xl">Search and filters</CardTitle>
                <CardDescription>
                  Focus on request updates, pending queue items, or recent review decisions.
                </CardDescription>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search people, permissions, notes, status..."
                  className="rounded-xl pl-9"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All notifications" },
                { id: "updates", label: "My updates" },
                ...(isAdmin
                  ? [
                      { id: "queue", label: "Pending queue" },
                      { id: "reviews", label: "Review decisions" },
                    ]
                  : []),
              ].map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={scope === item.id ? "default" : "outline"}
                  className="rounded-xl"
                  onClick={() => setScope(item.id as NotificationScope)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                  <Bell className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Your request updates</CardTitle>
                  <CardDescription>
                    Review status changes and notes related to your permission requests.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredUserUpdates.length ? (
                filteredUserUpdates.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.permissionName}</p>
                      <Badge variant="outline">{item.permissionCode}</Badge>
                      <Badge variant="secondary">{item.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {item.reason}
                    </p>
                    {item.reviewNote ? (
                      <p className="mt-3 text-sm text-foreground/80">
                        Review note: {item.reviewNote}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Updated {item.updatedAtLabel}</span>
                      {item.reviewerName ? <span>Reviewer {item.reviewerName}</span> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  No request update matches the current filter.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                  <Clock3 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Next actions</CardTitle>
                  <CardDescription>
                    Jump quickly into the routes that matter from your current access level.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start rounded-xl"
                )}
              >
                <Bell className="size-4" />
                Back to dashboard
              </Link>
              <Link
                href="/permissions/request"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start rounded-xl"
                )}
              >
                <ShieldCheck className="size-4" />
                Request access
              </Link>
              <Link
                href="/activity"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start rounded-xl"
                )}
              >
                <Clock3 className="size-4" />
                Open activity log
              </Link>
              <Link
                href="/profile"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start rounded-xl"
                )}
              >
                <UserCircle2 className="size-4" />
                Open profile
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin/permission-requests"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-xl"
                  )}
                >
                  <ShieldCheck className="size-4" />
                  Open admin request inbox
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {isAdmin ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="rounded-3xl border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Pending admin queue</CardTitle>
                <CardDescription>
                  Requests waiting for review right now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredAdminQueue.length ? (
                  filteredAdminQueue.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.userName}</p>
                        <Badge variant="outline">{item.permissionCode}</Badge>
                        <Badge variant="secondary">pending</Badge>
                      </div>
                      <p className="mt-2 break-all text-sm text-muted-foreground">
                        {item.userEmail}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {item.reason}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Created {item.createdAtLabel}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    No pending request matches the current filter.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Recent review decisions</CardTitle>
                <CardDescription>
                  Latest reviewed permission requests across the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredReviewedItems.length ? (
                  filteredReviewedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.userName}</p>
                        <Badge variant="outline">{item.permissionCode}</Badge>
                        <Badge variant="secondary">{item.status}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Reviewer {item.reviewerName ?? "Unknown reviewer"}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Reviewed {item.reviewedAtLabel ?? "-"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    No reviewed request matches the current filter.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </WorkspaceShell>
  );
}
