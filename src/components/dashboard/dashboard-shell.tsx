"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ChartColumn,
  ChevronRight,
  LayoutDashboard,
  Menu,
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
};

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
  { href: "/profile/security", label: "Security", icon: ShieldCheck },
];

const metricCards = [
  { label: "Status", value: "active", helper: "session state confirmed" },
  { label: "Role", value: "member", helper: "access level in current flow" },
  { label: "Coverage", value: "7 flows", helper: "playwright suite ready" },
  { label: "Mode", value: "learning", helper: "build and refine safely" },
];

export function DashboardShell({
  name,
  email,
  status,
  role,
}: DashboardShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                      className="text-sm text-muted-foreground break-all"
                      data-testid="dashboard-sidebar-email"
                    >
                      {email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="secondary">{status}</Badge>
                  <Badge variant="outline">{role}</Badge>
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
              <Button type="button" variant="outline" size="icon-sm" className="rounded-xl">
                <Bell className="size-4" />
              </Button>
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
                  ตอนนี้บัญชีของคุณผ่าน register, login และ identify แล้ว
                  พร้อมใช้หน้านี้เป็นจุดเริ่มต้นสำหรับทดลอง profile, security,
                  permissions และ admin flow ต่อได้
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/profile"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
                >
                  Open profile
                </Link>
                <Link href="/profile/security" className={cn(buttonVariants({}), "rounded-xl")}>
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
                    {index === 0 ? status : index === 1 ? role : metric.value}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {index === 0
                      ? "current account status after identify"
                      : index === 1
                        ? "current access role from auth profile"
                        : metric.helper}
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
                    <h2 className="text-xl font-semibold">Progress snapshot</h2>
                    <p className="text-sm text-muted-foreground">
                      Key milestones of the current internal access workflow
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {[
                    "Email/password account created successfully",
                    "Employee identity linked through identify flow",
                    "Session middleware now routes by real user status",
                    "Profile, security and admin areas are available by access rules",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-foreground" />
                        <span className="text-sm">{item}</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </article>

              <aside className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Quick access</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  ใช้ลัดสำหรับเปิด flow ที่เกี่ยวข้องกับการทดสอบระบบและตรวจสอบสถานะบัญชีของคุณ
                </p>

                <div className="mt-6 grid gap-3">
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
                </div>

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
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
