import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AuthShellProps = {
  title: string;
  description: string;
  eyebrow: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
};

export function AuthShell({
  title,
  description,
  eyebrow,
  children,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-8 text-foreground">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-xl space-y-8">
            <div className="space-y-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-full px-3 py-2 transition hover:bg-muted"
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                  <Sparkles className="size-4" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold">Intranet Auth Kit</p>
                  <p className="text-sm text-muted-foreground">{eyebrow}</p>
                </div>
              </Link>

              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {title}
                </h1>
                <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div>{children}</div>

            <div className="text-center text-sm text-muted-foreground">
              {footerText}{" "}
              <Link
                href={footerLinkHref}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {footerLinkLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
