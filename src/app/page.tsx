import Link from "next/link";
import { ArrowRight, Circle, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Build faster with production-ready flows",
    description:
      "Register, login, identify, dashboard, admin permissions และ automated tests ถูกวางไว้ให้เรียนรู้จากของจริงได้เลย",
  },
  {
    title: "Auth-first, then identity matching",
    description:
      "ผู้ใช้เริ่มจาก email/password ก่อน แล้วค่อยเชื่อมกับ employee record จริงผ่าน identify flow ที่ตรวจสอบได้",
  },
  {
    title: "Responsive by default",
    description:
      "โครงหน้าถูกออกแบบให้เริ่มจาก component มาตรฐานของ shadcn/ui และต่อยอดได้ทั้ง desktop และ mobile",
  },
  {
    title: "Access control that scales",
    description:
      "role, direct permission, middleware redirects และ e2e coverage ช่วยให้ขยายระบบได้อย่างมั่นใจขึ้น",
  },
];

const workflowTags = [
  "Authentication",
  "Identify",
  "Dashboard",
  "Employee Admin",
  "Permissions",
  "User Access",
  "Profile",
  "Security",
  "Playwright E2E",
];

const orbitDots = [
  { size: "size-5", className: "top-8 left-24" },
  { size: "size-6", className: "top-18 right-28" },
  { size: "size-8", className: "top-30 left-12" },
  { size: "size-10", className: "top-22 left-1/2 -translate-x-1/2" },
  { size: "size-12", className: "top-36 right-12" },
  { size: "size-14", className: "bottom-22 left-20" },
  { size: "size-16", className: "bottom-10 left-1/2 -translate-x-1/2" },
  { size: "size-12", className: "bottom-18 right-20" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Intranet Auth Kit</p>
              <p className="text-xs text-muted-foreground">
                Learning by building
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#workflow" className="transition hover:text-foreground">
              Workflow
            </a>
            <a href="#entry" className="transition hover:text-foreground">
              Get started
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-full"
              )}
            >
              Log in
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
            >
              Sign up
            </Link>
          </div>
        </header>

        <section
          id="entry"
          className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24"
        >
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-foreground" />
              <span>shadcn/ui + Next.js + Better Auth + Prisma</span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Learn, build, and verify your internal access flow.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                จาก register ไป identify ไป dashboard และต่อยอดถึง admin,
                permissions และ end-to-end tests ในโปรเจกต์เดียวที่คุณเรียนรู้จากของจริงได้ทันที
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
              >
                Start with Register
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "rounded-full"
                )}
              >
                Try Login
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-xl items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,_rgba(15,23,42,0.06),transparent_62%)] dark:bg-[radial-gradient(circle,_rgba(255,255,255,0.08),transparent_62%)]" />
            <div className="relative aspect-square w-full max-w-[420px] rounded-full border border-dashed border-border/80">
              {orbitDots.map((dot, index) => (
                <div
                  key={`${dot.className}-${index}`}
                  className={cn(
                    "absolute flex items-center justify-center rounded-full border border-border bg-card shadow-sm",
                    dot.size,
                    dot.className
                  )}
                >
                  <Circle
                    className={cn(
                      "size-2.5 fill-current",
                      index % 3 === 0
                        ? "text-slate-900 dark:text-slate-50"
                        : index % 3 === 1
                          ? "text-amber-500"
                          : "text-zinc-400"
                    )}
                  />
                </div>
              ))}

              <div className="absolute inset-1/2 flex size-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium">Core Flow</p>
                  <p className="text-xs text-muted-foreground">
                    Auth to access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="grid gap-8 border-t border-border py-14 md:grid-cols-2 xl:grid-cols-4"
        >
          {features.map((feature) => (
            <article key={feature.title} className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">
                {feature.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <section
          id="workflow"
          className="space-y-8 border-t border-border py-16 text-center"
        >
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
              Workflow
            </div>
            <h2 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              The best way to refine UI while keeping your real flow safe.
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-8 text-muted-foreground">
              ตอนนี้ระบบมี e2e coverage สำหรับ happy path และ access control แล้ว
              จึงสามารถ redesign หน้าจอได้โดยมี safety net คอยจับ regression ให้
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {workflowTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
