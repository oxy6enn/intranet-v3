"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Bell,
  BriefcaseBusiness,
  ChartColumn,
  Clock3,
  KeySquare,
  LayoutDashboard,
  Menu,
  Shield,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCircle2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

type WorkspaceShellProps = {
  name: string;
  email: string;
  status: string;
  role: string;
  pendingRequestCount: number;
  notificationCount: number;
  variant?: "user" | "admin";
  children: ReactNode;
};

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activity", label: "Activity", icon: Clock3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/permissions/request", label: "Permission requests", icon: KeySquare },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
  { href: "/profile/security", label: "Security", icon: ShieldCheck },
] as const;

const adminNav = [
  {
    href: "/admin/permission-requests",
    label: "Review request inbox",
    icon: ShieldAlert,
  },
  {
    href: "/admin/reports",
    label: "Admin reports",
    icon: ChartColumn,
  },
] as const;

const adminWorkspaceNav = [
  { href: "/admin/employees", label: "Employees", icon: UsersRound },
  { href: "/admin/permissions", label: "Permissions", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Users },
  {
    href: "/admin/permission-requests",
    label: "Request inbox",
    icon: ShieldAlert,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: ChartColumn,
  },
] as const;

const workspaceLinksForAdmin = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/activity", label: "Activity", icon: Clock3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/permissions/request", label: "Permission requests", icon: KeySquare },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
  { href: "/profile/security", label: "Security", icon: ShieldCheck },
] as const;

function isActiveRoute(pathname: string, href: string) {
  if (href === "/profile") {
    return pathname === "/profile";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function WorkspaceShell({
  name,
  email,
  status,
  role,
  pendingRequestCount,
  notificationCount,
  variant = "user",
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = role === "admin" || role === "super_admin";
  const isAdminShell = variant === "admin";
  const primarySections = isAdminShell ? adminWorkspaceNav : primaryNav;
  const secondarySections = isAdminShell
    ? workspaceLinksForAdmin
    : isAdmin
      ? adminNav
      : [];
  const brandTitle = isAdminShell ? "Intranet Admin" : "Intranet Kit";
  const brandSubtitle = isAdminShell
    ? "Operations workspace"
    : "Workspace navigation";
  const primarySectionLabel = isAdminShell ? "Admin" : "Navigation";
  const secondarySectionLabel = isAdminShell ? "Workspace" : "Admin";
  const searchPlaceholder = isAdminShell
    ? "Search employees, permissions, requests, reports..."
    : "Search users, permissions, requests, reports...";

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-background lg:flex lg:flex-col">
          <div className="border-b border-border px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-border bg-card">
                {isAdminShell ? (
                  <BriefcaseBusiness className="size-5" />
                ) : (
                  <LayoutDashboard className="size-5" />
                )}
              </div>
              <div>
                <p className="font-semibold">{brandTitle}</p>
                <p className="text-sm text-muted-foreground">{brandSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
            <section className="space-y-2">
              <p className="px-3 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {primarySectionLabel}
              </p>
              {primarySections.map(({ href, label, icon: Icon }) => {
                const active = isActiveRoute(pathname, href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      buttonVariants({ variant: active ? "secondary" : "ghost" }),
                      "h-11 w-full justify-start rounded-2xl px-3 text-sm"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </section>

            {secondarySections.length ? (
              <section className="space-y-2">
                <p className="px-3 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  {secondarySectionLabel}
                </p>
                {secondarySections.map(({ href, label, icon: Icon }) => {
                  const active = isActiveRoute(pathname, href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        buttonVariants({ variant: active ? "secondary" : "ghost" }),
                        "h-11 w-full justify-start rounded-2xl px-3 text-sm"
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                    );
                  })}
              </section>
            ) : null}

            <section className="space-y-3">
              <p className="px-3 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Account
              </p>
              <div className="rounded-3xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
                    <Users className="size-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
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
            </section>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-xl lg:hidden"
                onClick={() => setIsMenuOpen((value) => !value)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>

              <div className="min-w-0 flex-1">
                <div className="relative max-w-xl">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    aria-label="Search workspace"
                    placeholder={searchPlaceholder}
                    className="h-11 rounded-2xl pl-9"
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
                  {primarySections.map(({ href, label, icon: Icon }) => {
                    const active = isActiveRoute(pathname, href);

                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          buttonVariants({ variant: active ? "secondary" : "ghost" }),
                          "justify-start rounded-xl border border-border bg-card"
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{label}</span>
                        </Link>
                      );
                  })}
                  {secondarySections.length
                    ? secondarySections.map(({ href, label, icon: Icon }) => {
                        const active = isActiveRoute(pathname, href);

                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              buttonVariants({
                                variant: active ? "secondary" : "ghost",
                              }),
                              "justify-start rounded-xl border border-border bg-card"
                            )}
                          >
                            <Icon className="size-4" />
                            <span>{label}</span>
                          </Link>
                        );
                      })
                    : null}
                </div>
                <LogoutButton className="w-full justify-center rounded-xl sm:hidden" />
              </div>
            ) : null}
          </header>

          <div className="flex-1 px-4 py-6 sm:px-6 xl:px-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
