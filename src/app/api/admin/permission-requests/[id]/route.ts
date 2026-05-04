import {
  ACTIVITY_EVENT_TYPES,
  createActivityEvent,
} from "@/lib/activity-events";
import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { prisma } from "@/lib/prisma";
import { requirePermissionApiSession } from "@/lib/admin-api";
import { z } from "zod";

const reviewPermissionRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reviewNote: z.string().trim().max(500).optional().default(""),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requirePermissionApiSession(
    request,
    PERMISSION_CODES.PERMISSION_MANAGE
  );

  if (!authResult.ok) {
    return authResult.response;
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = reviewPermissionRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return Response.json(
      {
        error: "invalid_payload",
        message: "Please choose a valid review action.",
      },
      { status: 400 }
    );
  }

  const { id } = await params;
  const { action, reviewNote } = parsedPayload.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const permissionRequest = await tx.permissionRequest.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          userId: true,
          permissionId: true,
          status: true,
          user: {
            select: {
              name: true,
            },
          },
          permission: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      });

      if (!permissionRequest) {
        throw new Error("not_found");
      }

      if (permissionRequest.status !== PERMISSION_REQUEST_STATUS.PENDING) {
        throw new Error("already_reviewed");
      }

      const nextStatus =
        action === "approve"
          ? PERMISSION_REQUEST_STATUS.APPROVED
          : PERMISSION_REQUEST_STATUS.REJECTED;

      if (action === "approve") {
        await tx.userPermission.upsert({
          where: {
            userId_permissionId: {
              userId: permissionRequest.userId,
              permissionId: permissionRequest.permissionId,
            },
          },
          update: {
            createdBy: authResult.session.user.id,
          },
          create: {
            userId: permissionRequest.userId,
            permissionId: permissionRequest.permissionId,
            createdBy: authResult.session.user.id,
          },
        });
      }

      await tx.permissionRequest.update({
        where: {
          id: permissionRequest.id,
        },
        data: {
          status: nextStatus,
          reviewedBy: authResult.session.user.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote || null,
        },
      });

      return {
        nextStatus,
        permissionName: permissionRequest.permission.name,
        requesterName: permissionRequest.user.name,
        requesterId: permissionRequest.userId,
      };
    });

    await createActivityEvent({
      eventType:
        result.nextStatus === PERMISSION_REQUEST_STATUS.APPROVED
          ? ACTIVITY_EVENT_TYPES.PERMISSION_REQUEST_APPROVED
          : ACTIVITY_EVENT_TYPES.PERMISSION_REQUEST_REJECTED,
      actorId: authResult.session.user.id,
      actorName: authResult.session.user.name,
      subjectUserId: result.requesterId,
      subjectName: result.requesterName,
      entityType: "permission_request",
      entityId: id,
      title:
        result.nextStatus === PERMISSION_REQUEST_STATUS.APPROVED
          ? "Permission request approved"
          : "Permission request rejected",
      description:
        result.nextStatus === PERMISSION_REQUEST_STATUS.APPROVED
          ? `${authResult.session.user.name} approved ${result.permissionName} for ${result.requesterName}.`
          : `${authResult.session.user.name} rejected ${result.permissionName} for ${result.requesterName}.`,
    });

    return Response.json({
      message:
        result.nextStatus === PERMISSION_REQUEST_STATUS.APPROVED
          ? `${result.permissionName} was granted successfully.`
          : `${result.permissionName} was marked as rejected.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "not_found") {
      return Response.json(
        {
          error: "not_found",
          message: "This permission request no longer exists.",
        },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message === "already_reviewed") {
      return Response.json(
        {
          error: "already_reviewed",
          message: "This request was already reviewed by another admin.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        error: "internal_error",
        message: "We could not update this permission request right now.",
      },
      { status: 500 }
    );
  }
}
