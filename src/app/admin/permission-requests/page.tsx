import { Badge } from "@/components/ui/badge";
import { PermissionRequestsReview } from "@/components/admin/permission-requests-review";
import { requirePermissionSession } from "@/lib/auth-guards";
import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";

export default async function AdminPermissionRequestsPage() {
  await requirePermissionSession(PERMISSION_CODES.PERMISSION_MANAGE);

  const requests = await prisma.permissionRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      permission: {
        select: {
          code: true,
          name: true,
        },
      },
      reviewer: {
        select: {
          name: true,
          email: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const pendingCount = requests.filter(
    (request) => request.status === PERMISSION_REQUEST_STATUS.PENDING
  ).length;
  const approvedCount = requests.filter(
    (request) => request.status === PERMISSION_REQUEST_STATUS.APPROVED
  ).length;
  const rejectedCount = requests.filter(
    (request) => request.status === PERMISSION_REQUEST_STATUS.REJECTED
  ).length;
  const reviewedCount = approvedCount + rejectedCount;
  const approvalRate =
    reviewedCount > 0 ? Math.round((approvedCount / reviewedCount) * 100) : 0;
  const topRequestedPermissions = Object.values(
    requests.reduce<
      Record<
        string,
        {
          code: string;
          name: string;
          count: number;
        }
      >
    >((accumulator, request) => {
      if (!accumulator[request.permission.code]) {
        accumulator[request.permission.code] = {
          code: request.permission.code,
          name: request.permission.name,
          count: 0,
        };
      }

      accumulator[request.permission.code].count += 1;
      return accumulator;
    }, {})
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);

  const topRequesters = Object.values(
    requests.reduce<
      Record<
        string,
        {
          name: string;
          email: string;
          count: number;
        }
      >
    >((accumulator, request) => {
      if (!accumulator[request.user.email]) {
        accumulator[request.user.email] = {
          name: request.user.name,
          email: request.user.email,
          count: 0,
        };
      }

      accumulator[request.user.email].count += 1;
      return accumulator;
    }, {})
  )
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);

  const latestReviewedRequests = requests
    .filter((request) => request.reviewedAt)
    .sort((left, right) => {
      return (
        new Date(right.reviewedAt ?? 0).getTime() -
        new Date(left.reviewedAt ?? 0).getTime()
      );
    })
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Admin / Permission Requests
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Permission request inbox
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Review access requests from active users and decide whether each
            permission should be granted as a direct assignment.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Pending requests</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {pendingCount}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              waiting for admin review
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {approvedCount}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              requests converted into direct permissions
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Rejected</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {rejectedCount}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              requests that did not meet approval criteria
            </p>
          </article>
          <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Approval rate</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {approvalRate}%
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              based on reviewed requests only
            </p>
          </article>
        </section>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">permission:manage</Badge>
          <Badge variant="secondary">{requests.length} total requests</Badge>
        </div>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Top requested permissions</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Which permission codes are requested most often across the system
            </p>
            <div className="mt-6 space-y-3">
              {topRequestedPermissions.length ? (
                topRequestedPermissions.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.code}</p>
                    </div>
                    <Badge variant="secondary">{item.count} requests</Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                  No request data is available yet.
                </div>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Latest review activity</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Recent decisions made by admins, including reviewer context
            </p>
            <div className="mt-6 space-y-3">
              {latestReviewedRequests.length ? (
                latestReviewedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-border bg-card px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{request.user.name}</p>
                      <Badge variant="outline">{request.permission.code}</Badge>
                      <Badge variant="secondary">{request.status}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Reviewer: {request.reviewer?.name ?? "Unknown reviewer"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Reviewed at{" "}
                      {request.reviewedAt?.toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) ?? "-"}
                    </p>
                    {request.reviewNote ? (
                      <p className="mt-3 text-sm text-foreground/80">
                        Note: {request.reviewNote}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
                  No reviewed request is available yet.
                </div>
              )}
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Most active requesters</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Users who currently generate the most permission requests
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topRequesters.length ? (
              topRequesters.map((item) => (
                <div
                  key={item.email}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {item.email}
                  </p>
                  <p className="mt-4 text-2xl font-semibold">{item.count}</p>
                  <p className="text-sm text-muted-foreground">requests sent</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground md:col-span-2 xl:col-span-4">
                No requester activity is available yet.
              </div>
            )}
          </div>
        </section>

        <PermissionRequestsReview
          requests={requests.map((request) => ({
            id: request.id,
            requesterName: request.user.name,
            requesterEmail: request.user.email,
            reviewerName: request.reviewer?.name ?? null,
            reviewerEmail: request.reviewer?.email ?? null,
            permissionCode: request.permission.code,
            permissionName: request.permission.name,
            reason: request.reason,
            status: request.status,
            createdAtLabel: request.createdAt.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            reviewedAtLabel: request.reviewedAt
              ? request.reviewedAt.toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null,
            reviewNote: request.reviewNote,
          }))}
        />
      </div>
    </main>
  );
}
