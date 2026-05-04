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
        </section>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">permission:manage</Badge>
          <Badge variant="secondary">{requests.length} total requests</Badge>
        </div>

        <PermissionRequestsReview
          requests={requests.map((request) => ({
            id: request.id,
            requesterName: request.user.name,
            requesterEmail: request.user.email,
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
