"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChartColumn,
  Clock3,
  FileClock,
  KeySquare,
  LayoutDashboard,
  Menu,
  ShieldAlert,
  Search,
  ShieldCheck,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/permissions/request", label: "Permission requests", icon: KeySquare },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
  { href: "/profile/security", label: "Security", icon: ShieldCheck },
];

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = role === "admin" || role === "super_admin";
  const metricCards = [
    {
      label: "Current status",
      value: status,
      helper: "real-time account status from the session",
    },
    {
      label: "Role",
      value: role,
      helper: "current access role from the auth profile",
    },
    {
      label: "Direct permissions",
      value: String(directPermissions.length),
      helper: "extra permission codes assigned to this user",
    },
    {
      label: "Pending requests",
      value: String(requestStats.pending),
      helper: "permission requests still waiting for review",
    },
  ];

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 border-r border-border bg-background lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-border px-6 py-6">
            <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-card">
              <LayoutDashboard className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Intranet Kit</p>
              <p className="text-sm text-muted-foreground">Access workspace</p>
            </div>
          </div>

          <div className="flex-1 px-4 py-6">
            <div className="space-y-2">
              <p className="px-3 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Overview
              </p>
              {primaryNav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-11 w-full justify-start rounded-xl px-3 text-sm"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-8 space-y-2">
              <p className="px-3 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Workspace
              </p>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Users className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{name}</p>
                    <p
                      className="break-all text-sm text-muted-foreground"
                      data-testid="dashboard-sidebar-email"
                    >
                      {email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{status}</Badge>
                  <Badge variant="outline">{role}</Badge>
                  {pendingRequestCount ? (
                    <Badge variant="outline">
                      {pendingRequestCount} pending request
                      {pendingRequestCount > 1 ? "s" : ""}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-border bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-xl lg:hidden"
                onClick={() => setIsMenuOpen((value) => !value)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="size-4" />
                ) : (
                  <Menu className="size-4" />
                )}
              </Button>

              <div className="min-w-0 flex-1">
                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label="Search workspace"
                    placeholder="Search users, workspace, permissions..."
                    className="h-11 rounded-xl pl-9"
                  />
                </div>
              </div>

              <ThemeToggle />
              <Link
                href="/notifications"
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon-sm" }),
                  "relative rounded-xl"
                )}
                aria-label="Open notifications"
              >
                <Bell className="size-4" />
                {notificationCount ? (
                  <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                ) : null}
              </Link>
              <div className="hidden sm:block">
                <LogoutButton className="rounded-xl" />
              </div>
            </div>

            {isMenuOpen ? (
              <div className="space-y-3 border-t border-border px-4 py-4 lg:hidden">
                <div className="grid gap-2">
                  {primaryNav.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "justify-start rounded-xl border border-border bg-card"
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
                <LogoutButton className="w-full justify-center rounded-xl sm:hidden" />
              </div>
            ) : null}
          </header>

          <div className="flex-1 space-y-6 px-4 py-6 sm:px-6">
            <section className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-6 shadow-sm xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Welcome back, {name}
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  Your account is active and ready for internal workflows. Use
                  this dashboard to review profile information, request extra
                  access, and continue validating the system end-to-end.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/permissions/request"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-xl"
                  )}
                >
                  Request access
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-xl"
                  )}
                >
                  Open profile
                </Link>
                <Link
                  href="/profile/security"
                  className={cn(buttonVariants({}), "rounded-xl")}
                >
                  Security settings
                </Link>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-4">
              {metricCards.map((metric, index) => (
                <article
                  key={metric.label}
                  className={cn(
                    "rounded-3xl border border-border bg-background p-6 shadow-sm",
                    index === 0 && "xl:col-span-2"
                  )}
                >
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-4 text-4xl font-semibold tracking-tight">
                    {metric.value}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {metric.helper}
                  </p>
                </article>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                    <ChartColumn className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Recent access activity</h2>
                    <p className="text-sm text-muted-foreground">
                      Live snapshot of your latest permission requests and review outcomes
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {recentRequests.length ? (
                    recentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="rounded-2xl border border-border bg-card px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">
                            {request.permissionName}
                          </span>
                          <Badge variant="outline">{request.permissionCode}</Badge>
                          <Badge variant="secondary">{request.status}</Badge>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {request.reason}
                        </p>
                        {request.reviewNote ? (
                          <p className="mt-3 text-sm text-foreground/80">
                            Review note: {request.reviewNote}
                          </p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          <span>Created {request.createdAtLabel}</span>
                          <span>Updated {request.updatedAtLabel}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6">
                      <p className="text-sm text-muted-foreground">
                        No permission request has been sent yet. Use the request access
                        action to open your first approval workflow.
                      </p>
                    </div>
                  )}
                </div>
              </article>

              <aside className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Live workspace summary</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Real information pulled from your account, employee identity,
                  and permission history.
                </p>

                <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-medium">Session summary</p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p className="break-all" data-testid="dashboard-session-email">
                      <span className="font-medium text-foreground">Email:</span>{" "}
                      {email}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Status:</span>{" "}
                      {status}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Role:</span>{" "}
                      {role}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Pending requests:
                      </span>{" "}
                      {pendingRequestCount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card p-4">
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
                        <span className="font-medium text-foreground">
                          Department:
                        </span>{" "}
                        {employeeSummary.department}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Position:
                        </span>{" "}
                        {employeeSummary.position}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No employee record is linked yet.
                    </p>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <FileClock className="size-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Request outcomes</p>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-xl border border-border px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Pending
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {requestStats.pending}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Approved
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {requestStats.approved}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Rejected
                      </p>
                      <p className="mt-2 text-2xl font-semibold">
                        {requestStats.rejected}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Direct permissions</h2>
                    <p className="text-sm text-muted-foreground">
                      Actual permission codes attached to your account
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {directPermissions.length ? (
                    directPermissions.map((permission) => (
                      <Badge key={permission.code} variant="outline" className="px-3 py-1">
                        {permission.code}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No direct permission is assigned yet. Your access is currently
                      controlled by role only.
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                    <Clock3 className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Next steps</h2>
                    <p className="text-sm text-muted-foreground">
                      Jump to the routes that matter most from your current state
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <Link
                    href="/notifications"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "justify-start rounded-xl"
                    )}
                  >
                    <Bell className="size-4" />
                    Notification center
                    {notificationCount ? (
                      <Badge variant="secondary" className="ml-auto">
                        {notificationCount}
                      </Badge>
                    ) : null}
                  </Link>
                  <Link
                    href="/permissions/request"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "justify-start rounded-xl"
                    )}
                  >
                    <KeySquare className="size-4" />
                    Request access
                  </Link>
                  <Link
                    href="/profile"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "justify-start rounded-xl"
                    )}
                  >
                    <UserCircle2 className="size-4" />
                    Profile details
                  </Link>
                  <Link
                    href="/profile/security"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "justify-start rounded-xl"
                    )}
                  >
                    <ShieldCheck className="size-4" />
                    Social linking
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/admin/permission-requests"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "justify-start rounded-xl"
                      )}
                    >
                      <ShieldAlert className="size-4" />
                      Review request inbox
                    </Link>
                  ) : null}
                </div>
              </article>
            </section>

            {adminSnapshot ? (
              <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Admin snapshot</h2>
                    <p className="text-sm text-muted-foreground">
                      Live operational counts from the current database
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Pending queue</p>
                    <p className="mt-3 text-3xl font-semibold">
                      {adminSnapshot.pendingQueueCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Active users</p>
                    <p className="mt-3 text-3xl font-semibold">
                      {adminSnapshot.activeUserCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">Claimed employees</p>
                    <p className="mt-3 text-3xl font-semibold">
                      {adminSnapshot.claimedEmployeeCount}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <p className="text-sm text-muted-foreground">
                      Permission catalog
                    </p>
                    <p className="mt-3 text-3xl font-semibold">
                      {adminSnapshot.permissionCatalogCount}
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
