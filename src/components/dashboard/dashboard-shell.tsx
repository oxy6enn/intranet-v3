"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Bell,
  ChartColumn,
  Clock3,
  FileClock,
  KeySquare,
  ShieldAlert,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  name: string;
  email: string;
  status: string;
  role: string;
  pendingRequestCount: number;
  notificationCount: number;
  employeeSummary: {
    employeeCode: string;
    department: string;
    position: string;
  } | null;
  directPermissions: Array<{
    code: string;
    name: string;
  }>;
  requestStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recentRequests: Array<{
    id: string;
    permissionCode: string;
    permissionName: string;
    status: string;
    reason: string;
    reviewNote: string | null;
    createdAtLabel: string;
    updatedAtLabel: string;
  }>;
  adminSnapshot: {
    pendingQueueCount: number;
    activeUserCount: number;
    claimedEmployeeCount: number;
    permissionCatalogCount: number;
  } | null;
};

export function DashboardShell({
  name,
  email,
  status,
  role,
  pendingRequestCount,
  notificationCount,
  employeeSummary,
  directPermissions,
  requestStats,
  recentRequests,
  adminSnapshot,
}: DashboardShellProps) {
  const isAdmin = role === "admin" || role === "super_admin";

  const metricCards = [
    {
      label: "Current status",
      value: status,
      helper: "live account state from the current session",
    },
    {
      label: "Role",
      value: role,
      helper: "current access scope for this account",
    },
    {
      label: "Direct permissions",
      value: String(directPermissions.length),
      helper: "extra permission codes attached directly to this user",
    },
    {
      label: "Pending requests",
      value: String(requestStats.pending),
      helper: "open requests still waiting for review",
    },
  ];

  const workspaceShortcuts = [
    {
      href: "/permissions/request",
      label: "Request access",
      description: "Open a new access request workflow",
      icon: KeySquare,
    },
    {
      href: "/activity",
      label: "Activity log",
      description: "Review identity and permission events",
      icon: Clock3,
    },
    {
      href: "/notifications",
      label: "Notification center",
      description: "See request updates and review queue items",
      icon: Bell,
      badge: notificationCount ? String(notificationCount) : null,
    },
    {
      href: "/profile",
      label: "Profile details",
      description: "Review the linked account information",
      icon: UserCircle2,
    },
    {
      href: "/profile/security",
      label: "Security settings",
      description: "Manage linked providers and account security",
      icon: ShieldCheck,
    },
    ...(isAdmin
      ? [
          {
            href: "/admin/permission-requests",
            label: "Review request inbox",
            description: "Handle pending access requests from users",
            icon: ShieldAlert,
          },
          {
            href: "/admin/reports",
            label: "Admin reports",
            description: "Open cross-view audit and reporting summary",
            icon: ChartColumn,
          },
        ]
      : []),
  ];

  return (
    <WorkspaceShell
      name={name}
      email={email}
      status={status}
      role={role}
      pendingRequestCount={pendingRequestCount}
      notificationCount={notificationCount}
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          <article className="overflow-hidden rounded-[2rem] border border-border bg-background shadow-sm">
            <div className="border-b border-border bg-gradient-to-br from-background via-background to-muted/60 px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ChartColumn className="size-4" />
                    <span>Dashboard workspace</span>
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Welcome back, {name}
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                    This workspace brings together your account status,
                    employee identity, permission requests, and admin tools
                    in one place so you can move through the system with less context switching.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/permissions/request" className={cn(buttonVariants({}), "rounded-2xl")}>
                    Request access
                  </Link>
                  <Link
                    href="/profile"
                    className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
                  >
                    Open profile
                  </Link>
                  <Link
                    href="/profile/security"
                    className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
                  >
                    Security settings
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
              {metricCards.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-3xl border border-border bg-card px-4 py-5"
                >
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">{metric.value}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{metric.helper}</p>
                </article>
              ))}
            </div>
          </article>

          <aside className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Session snapshot</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Real information pulled from the current account session and linked employee record.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-sm font-medium">Session summary</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p className="break-all" data-testid="dashboard-session-email">
                    <span className="font-medium text-foreground">Email:</span> {email}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Status:</span> {status}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Role:</span> {role}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Pending requests:</span>{" "}
                    {pendingRequestCount}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Employee identity</p>
                </div>
                {employeeSummary ? (
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Code:</span>{" "}
                      {employeeSummary.employeeCode}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Department:</span>{" "}
                      {employeeSummary.department}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Position:</span>{" "}
                      {employeeSummary.position}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No employee record is linked yet.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <FileClock className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Request outcomes</p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-xl border border-border px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Pending
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{requestStats.pending}</p>
                  </div>
                  <div className="rounded-xl border border-border px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Approved
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{requestStats.approved}</p>
                  </div>
                  <div className="rounded-xl border border-border px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Rejected
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{requestStats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <article className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card">
                <ChartColumn className="size-4" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Recent access activity</h2>
                <p className="text-sm text-muted-foreground">
                  The latest permission requests and review outcomes connected to this account
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {recentRequests.length ? (
                recentRequests.map((request) => (
                  <div key={request.id} className="rounded-3xl border border-border bg-card px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{request.permissionName}</span>
                      <Badge variant="outline">{request.permissionCode}</Badge>
                      <Badge variant="secondary">{request.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{request.reason}</p>
                    {request.reviewNote ? (
                      <p className="mt-3 text-sm text-foreground/80">Review note: {request.reviewNote}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Created {request.createdAtLabel}</span>
                      <span>Updated {request.updatedAtLabel}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card px-4 py-6">
                  <p className="text-sm text-muted-foreground">
                    No permission request has been sent yet. Use the request access
                    action to open your first approval workflow.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card">
                <ArrowUpRight className="size-4" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Quick actions</h2>
                <p className="text-sm text-muted-foreground">
                  Routes you are most likely to need next from the current state
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {workspaceShortcuts.map(({ href, label, description, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-3xl border border-border bg-card px-4 py-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl border border-border bg-background">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{label}</p>
                        {badge ? <Badge variant="secondary">{badge}</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    </div>
                    <ArrowUpRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Direct permissions</h2>
                <p className="text-sm text-muted-foreground">
                  Permission codes assigned directly to this account
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {directPermissions.length ? (
                directPermissions.map((permission) => (
                  <Badge key={permission.code} variant="outline" className="rounded-full px-3 py-1">
                    {permission.code}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No direct permission is assigned yet. Your access is currently controlled by role only.
                </p>
              )}
            </div>
          </article>

          {adminSnapshot ? (
            <article className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card">
                  <Users className="size-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Admin snapshot</h2>
                  <p className="text-sm text-muted-foreground">
                    Live operational counts for the current database state
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Pending queue</p>
                  <p className="mt-3 text-3xl font-semibold">{adminSnapshot.pendingQueueCount}</p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Active users</p>
                  <p className="mt-3 text-3xl font-semibold">{adminSnapshot.activeUserCount}</p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Claimed employees</p>
                  <p className="mt-3 text-3xl font-semibold">{adminSnapshot.claimedEmployeeCount}</p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Permission catalog</p>
                  <p className="mt-3 text-3xl font-semibold">{adminSnapshot.permissionCatalogCount}</p>
                </div>
              </div>
            </article>
          ) : (
            <article className="rounded-[2rem] border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-card">
                  <BadgeCheck className="size-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Usage guidance</h2>
                  <p className="text-sm text-muted-foreground">
                    Suggested path for a standard user after the initial setup
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  "ตรวจสอบข้อมูลบัญชีและ employee identity ให้ถูกต้อง",
                  "ขอสิทธิ์ที่ยังขาดผ่านหน้า Permission requests",
                  "ติดตามผลผ่าน Notifications และ Activity log",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border bg-card px-4 py-4 text-sm text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}
