import { PermissionRequestsWorkspace } from "@/components/admin/permission-requests-workspace";
import { requirePermissionSession } from "@/lib/auth-guards";
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
        <PermissionRequestsWorkspace
          totalRequests={requests.length}
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
            createdAtIso: request.createdAt.toISOString(),
            createdAtLabel: request.createdAt.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            reviewedAtIso: request.reviewedAt
              ? request.reviewedAt.toISOString()
              : null,
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
