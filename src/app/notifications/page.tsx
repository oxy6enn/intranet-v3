import { NotificationsCenterView } from "@/components/notifications/notifications-center-view";
import { requireActiveSession } from "@/lib/auth-guards";
import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/user-role";

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

  return (
    <NotificationsCenterView
      isAdmin={isAdmin}
      userRequestUpdates={userRequestUpdates.map((item) => ({
        id: item.id,
        status: item.status,
        reason: item.reason,
        reviewNote: item.reviewNote,
        updatedAtLabel: item.updatedAt.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        permissionCode: item.permission.code,
        permissionName: item.permission.name,
        reviewerName: item.reviewer?.name ?? null,
      }))}
      adminReviewQueue={adminReviewQueue.map((item) => ({
        id: item.id,
        reason: item.reason,
        createdAtLabel: item.createdAt.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        permissionCode: item.permission.code,
        permissionName: item.permission.name,
        userName: item.user.name,
        userEmail: item.user.email,
      }))}
      latestReviewedItems={latestReviewedItems.map((item) => ({
        id: item.id,
        status: item.status,
        reviewedAtLabel: item.reviewedAt?.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) ?? null,
        permissionCode: item.permission.code,
        userName: item.user.name,
        reviewerName: item.reviewer?.name ?? null,
      }))}
    />
  );
}
