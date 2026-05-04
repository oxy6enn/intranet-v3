import Link from "next/link";
import { Bell, Clock3, ShieldCheck, UserCircle2 } from "lucide-react";
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
import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/user-role";
import { cn } from "@/lib/utils";

export default async function NotificationsPage() {
  const session = await requireActiveSession();
  const isAdmin = isAdminRole(session.user.role);

  const [userRequestUpdates, adminReviewQueue, latestReviewedItems] =
    await Promise.all([
      prisma.permissionRequest.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 8,
        select: {
          id: true,
          status: true,
          reason: true,
          reviewNote: true,
          updatedAt: true,
          permission: {
            select: {
              code: true,
              name: true,
            },
          },
          reviewer: {
            select: {
              name: true,
            },
          },
        },
      }),
      isAdmin
        ? prisma.permissionRequest.findMany({
            where: {
              status: PERMISSION_REQUEST_STATUS.PENDING,
            },
            orderBy: {
              createdAt: "asc",
            },
            take: 8,
            select: {
              id: true,
              reason: true,
              createdAt: true,
              permission: {
                select: {
                  code: true,
                  name: true,
                },
              },
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          })
        : Promise.resolve([]),
      isAdmin
        ? prisma.permissionRequest.findMany({
            where: {
              status: {
                in: [
                  PERMISSION_REQUEST_STATUS.APPROVED,
                  PERMISSION_REQUEST_STATUS.REJECTED,
                ],
              },
            },
            orderBy: {
              reviewedAt: "desc",
            },
            take: 6,
            select: {
              id: true,
              status: true,
              reviewedAt: true,
              permission: {
                select: {
                  code: true,
                },
              },
              user: {
                select: {
                  name: true,
                },
              },
              reviewer: {
                select: {
                  name: true,
                },
              },
            },
          })
        : Promise.resolve([]),
    ]);

  const notificationCount = isAdmin
    ? adminReviewQueue.length
    : userRequestUpdates.length;

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
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
            <p className="text-sm text-muted-foreground">Attention items</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {notificationCount}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              current notifications shown in this center
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Your recent updates</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {userRequestUpdates.length}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              permission request updates for this account
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Pending review queue" : "Admin review visibility"}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {isAdmin ? adminReviewQueue.length : 0}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {isAdmin
                ? "requests that still need an admin decision"
                : "available after admin role is granted"}
            </p>
          </article>
        </section>

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
              {userRequestUpdates.length ? (
                userRequestUpdates.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.permission.name}</p>
                      <Badge variant="outline">{item.permission.code}</Badge>
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
                      <span>
                        Updated{" "}
                        {item.updatedAt.toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {item.reviewer?.name ? (
                        <span>Reviewer {item.reviewer.name}</span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                  No request update is available yet.
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
                {adminReviewQueue.length ? (
                  adminReviewQueue.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.user.name}</p>
                        <Badge variant="outline">{item.permission.code}</Badge>
                        <Badge variant="secondary">pending</Badge>
                      </div>
                      <p className="mt-2 break-all text-sm text-muted-foreground">
                        {item.user.email}
                      </p>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {item.reason}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Created{" "}
                        {item.createdAt.toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    No pending request is waiting in the admin queue.
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
                {latestReviewedItems.length ? (
                  latestReviewedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.user.name}</p>
                        <Badge variant="outline">{item.permission.code}</Badge>
                        <Badge variant="secondary">{item.status}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Reviewer {item.reviewer?.name ?? "Unknown reviewer"}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Reviewed{" "}
                        {item.reviewedAt?.toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) ?? "-"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
                    No reviewed request is available yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
