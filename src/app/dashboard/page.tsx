import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";
import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/user-role";
import { USER_STATUS } from "@/lib/user-status";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.status === USER_STATUS.SUSPENDED) {
    redirect("/suspended");
  }

  if (session.user.status === USER_STATUS.PENDING_IDENTIFY) {
    redirect("/identify");
  }

  const isAdmin = isAdminRole(session.user.role);
  const [
    userRecord,
    requestCounts,
    recentRequests,
    adminSnapshot,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        claimedEmployee: {
          select: {
            employeeCode: true,
            department: true,
            position: true,
          },
        },
        permissions: {
          select: {
            permission: {
              select: {
                code: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),
    prisma.permissionRequest.groupBy({
      by: ["status"],
      where: {
        userId: session.user.id,
      },
      _count: {
        _all: true,
      },
    }),
    prisma.permissionRequest.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
      select: {
        id: true,
        status: true,
        reason: true,
        reviewNote: true,
        createdAt: true,
        updatedAt: true,
        permission: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    }),
    isAdmin
      ? Promise.all([
          prisma.permissionRequest.count({
            where: {
              status: PERMISSION_REQUEST_STATUS.PENDING,
            },
          }),
          prisma.user.count({
            where: {
              status: USER_STATUS.ACTIVE,
            },
          }),
          prisma.employee.count({
            where: {
              isClaimed: true,
            },
          }),
          prisma.permission.count(),
        ]).then(
          ([pendingQueueCount, activeUserCount, claimedEmployeeCount, permissionCatalogCount]) => ({
            pendingQueueCount,
            activeUserCount,
            claimedEmployeeCount,
            permissionCatalogCount,
          })
        )
      : Promise.resolve(null),
  ]);

  const requestCountMap = requestCounts.reduce<Record<string, number>>(
    (accumulator, item) => {
      accumulator[item.status] = item._count._all;
      return accumulator;
    },
    {}
  );

  const pendingRequestCount =
    requestCountMap[PERMISSION_REQUEST_STATUS.PENDING] ?? 0;
  const notificationCount = isAdmin
    ? adminSnapshot?.pendingQueueCount ?? 0
    : recentRequests.length;

  return (
    <DashboardShell
      name={session.user.name}
      email={session.user.email}
      status={session.user.status}
      role={session.user.role}
      pendingRequestCount={pendingRequestCount}
      notificationCount={notificationCount}
      employeeSummary={
        userRecord?.claimedEmployee
          ? {
              employeeCode: userRecord.claimedEmployee.employeeCode,
              department: userRecord.claimedEmployee.department ?? "Not set",
              position: userRecord.claimedEmployee.position ?? "Not set",
            }
          : null
      }
      directPermissions={userRecord?.permissions.map((item) => ({
        code: item.permission.code,
        name: item.permission.name,
      })) ?? []}
      requestStats={{
        pending: pendingRequestCount,
        approved: requestCountMap[PERMISSION_REQUEST_STATUS.APPROVED] ?? 0,
        rejected: requestCountMap[PERMISSION_REQUEST_STATUS.REJECTED] ?? 0,
      }}
      recentRequests={recentRequests.map((request) => ({
        id: request.id,
        permissionCode: request.permission.code,
        permissionName: request.permission.name,
        status: request.status,
        reason: request.reason,
        reviewNote: request.reviewNote,
        createdAtLabel: request.createdAt.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        updatedAtLabel: request.updatedAt.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))}
      adminSnapshot={adminSnapshot}
    />
  );
}
