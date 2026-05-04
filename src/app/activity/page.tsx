import Link from "next/link";
import { Clock3, ShieldCheck, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireActiveSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/user-role";
import { cn } from "@/lib/utils";

export default async function ActivityPage() {
  const session = await requireActiveSession();
  const isAdmin = isAdminRole(session.user.role);

  const [events, totalEvents] = await Promise.all([
    prisma.activityEvent.findMany({
      where: isAdmin
        ? undefined
        : {
            OR: [
              {
                actorId: session.user.id,
              },
              {
                subjectUserId: session.user.id,
              },
            ],
          },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    }),
    prisma.activityEvent.count({
      where: isAdmin
        ? undefined
        : {
            OR: [
              {
                actorId: session.user.id,
              },
              {
                subjectUserId: session.user.id,
              },
            ],
          },
    }),
  ]);

  const identifyEvents = events.filter(
    (event) => event.eventType === "identify.completed"
  ).length;
  const requestEvents = events.filter((event) =>
    event.eventType.startsWith("permission_request.")
  ).length;

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <Badge variant="outline">Workspace / Activity</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Activity log
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            A chronological view of important identity, permission request, and
            review events recorded by the system.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Visible events</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {totalEvents}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              events available in this current activity view
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Identify events</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {identifyEvents}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              employee verification milestones recorded
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Request events</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {requestEvents}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              permission request and review events tracked
            </p>
          </article>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-card">
                  <Clock3 className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Timeline</CardTitle>
                  <CardDescription>
                    Latest recorded events ordered from newest to oldest.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge variant="outline">{event.eventType}</Badge>
                      {event.entityType ? (
                        <Badge variant="secondary">{event.entityType}</Badge>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <span>
                        {event.createdAt.toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {event.actorName ? <span>Actor {event.actorName}</span> : null}
                      {event.subjectName ? (
                        <span>Subject {event.subjectName}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  No activity event is recorded yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Related routes</CardTitle>
              <CardDescription>
                Jump quickly between the core workflow and its audit trail.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start rounded-xl"
                )}
              >
                <Clock3 className="size-4" />
                Back to dashboard
              </Link>
              <Link
                href="/notifications"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start rounded-xl"
                )}
              >
                <ShieldCheck className="size-4" />
                Notification center
              </Link>
              <Link
                href="/permissions/request"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "justify-start rounded-xl"
                )}
              >
                <ShieldCheck className="size-4" />
                Permission requests
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
              {isAdmin ? (
                <Link
                  href="/admin/permission-requests"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "justify-start rounded-xl"
                  )}
                >
                  <ShieldCheck className="size-4" />
                  Admin request inbox
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
