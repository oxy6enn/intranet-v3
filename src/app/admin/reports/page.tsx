import { AdminReportsWorkspace } from "@/components/admin/admin-reports-workspace";
import { requirePermissionSession } from "@/lib/auth-guards";
import { ACTIVITY_EVENT_TYPES } from "@/lib/activity-events";
import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";
import { USER_STATUS } from "@/lib/user-status";

function getDaysAgo(days: number) {
  const reference = new Date();
  reference.setDate(reference.getDate() - days);
  return reference;
}

export default async function AdminReportsPage() {
  await requirePermissionSession(PERMISSION_CODES.REPORT_VIEW);

  const last7Days = getDaysAgo(7);

  const [
    totalActivityEvents,
    activityLast7Days,
    totalPermissionRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    reviewedLast7Days,
    activeUsers,
    eventBreakdownRaw,
    permissionRequests,
    recentReviewDecisions,
    recentActivity,
  ] = await Promise.all([
    prisma.activityEvent.count(),
    prisma.activityEvent.count({
      where: {
        createdAt: {
          gte: last7Days,
        },
      },
    }),
    prisma.permissionRequest.count(),
    prisma.permissionRequest.count({
      where: {
        status: PERMISSION_REQUEST_STATUS.PENDING,
      },
    }),
    prisma.permissionRequest.count({
      where: {
        status: PERMISSION_REQUEST_STATUS.APPROVED,
      },
    }),
    prisma.permissionRequest.count({
      where: {
        status: PERMISSION_REQUEST_STATUS.REJECTED,
      },
    }),
    prisma.permissionRequest.count({
      where: {
        reviewedAt: {
          gte: last7Days,
        },
        status: {
          in: [
            PERMISSION_REQUEST_STATUS.APPROVED,
            PERMISSION_REQUEST_STATUS.REJECTED,
          ],
        },
      },
    }),
    prisma.user.count({
      where: {
        status: USER_STATUS.ACTIVE,
      },
    }),
    prisma.activityEvent.groupBy({
      by: ["eventType"],
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          eventType: "desc",
        },
      },
    }),
    prisma.permissionRequest.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.permissionRequest.findMany({
      where: {
        status: {
          in: [
            PERMISSION_REQUEST_STATUS.APPROVED,
            PERMISSION_REQUEST_STATUS.REJECTED,
          ],
        },
      },
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
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        reviewedAt: "desc",
      },
      take: 8,
    }),
    prisma.activityEvent.findMany({
      where: {
        eventType: {
          in: [
            ACTIVITY_EVENT_TYPES.IDENTIFY_COMPLETED,
            ACTIVITY_EVENT_TYPES.PERMISSION_REQUEST_CREATED,
            ACTIVITY_EVENT_TYPES.PERMISSION_REQUEST_APPROVED,
            ACTIVITY_EVENT_TYPES.PERMISSION_REQUEST_REJECTED,
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    }),
  ]);

  const permissionDemand = Object.values(
    permissionRequests.reduce<
      Record<string, { code: string; name: string; count: number }>
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
    .slice(0, 5);

  const topRequesters = Object.values(
    permissionRequests.reduce<
      Record<string, { name: string; email: string; count: number }>
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
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-muted/40 px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Admin / Reports
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Operational audit reports
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            A cross-view summary for permission demand, review throughput, and
            audit activity across the current workspace.
          </p>
        </div>

        <AdminReportsWorkspace
          summary={{
            totalActivityEvents,
            totalPermissionRequests,
            pendingRequests,
            approvedRequests,
            rejectedRequests,
            reviewedLast7Days,
            activityLast7Days,
            activeUsers,
          }}
          eventBreakdown={eventBreakdownRaw.map((item) => ({
            key: item.eventType,
            count: item._count._all,
          }))}
          permissionDemand={permissionDemand}
          topRequesters={topRequesters}
          recentReviewDecisions={recentReviewDecisions.map((item) => ({
            id: item.id,
            requesterName: item.user.name,
            permissionCode: item.permission.code,
            permissionName: item.permission.name,
            status: item.status,
            reviewerName: item.reviewer?.name ?? null,
            reviewedAtLabel:
              item.reviewedAt?.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }) ?? "-",
            reviewNote: item.reviewNote,
          }))}
          recentActivity={recentActivity.map((item) => ({
            id: item.id,
            eventType: item.eventType,
            title: item.title,
            description: item.description,
            actorName: item.actorName,
            createdAtLabel: item.createdAt.toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))}
        />
      </div>
    </main>
  );
}
