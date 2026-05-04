import {
  ACTIVITY_EVENT_TYPES,
  createActivityEvent,
} from "@/lib/activity-events";
import { auth } from "@/lib/auth";
import { PERMISSION_REQUEST_STATUS } from "@/lib/permission-request-status";
import { prisma } from "@/lib/prisma";
import { USER_STATUS } from "@/lib/user-status";
import { z } from "zod";

const createPermissionRequestSchema = z.object({
  permissionId: z.string().min(1),
  reason: z.string().trim().min(10).max(500),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return Response.json(
      {
        error: "unauthorized",
        message: "Please sign in before sending a permission request.",
      },
      { status: 401 }
    );
  }

  if (session.user.status === USER_STATUS.SUSPENDED) {
    return Response.json(
      {
        error: "suspended",
        message: "This account is suspended and cannot send new requests.",
      },
      { status: 403 }
    );
  }

  if (session.user.status !== USER_STATUS.ACTIVE) {
    return Response.json(
      {
        error: "invalid_status",
        message: "Complete employee identification before requesting new access.",
      },
      { status: 403 }
    );
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = createPermissionRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return Response.json(
      {
        error: "invalid_payload",
        message: "Please provide a valid permission and a clear request reason.",
      },
      { status: 400 }
    );
  }

  const { permissionId, reason } = parsedPayload.data;

  const [permission, existingAssignment, existingPendingRequest] =
    await Promise.all([
      prisma.permission.findUnique({
        where: {
          id: permissionId,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.userPermission.findUnique({
        where: {
          userId_permissionId: {
            userId: session.user.id,
            permissionId,
          },
        },
      }),
      prisma.permissionRequest.findFirst({
        where: {
          userId: session.user.id,
          permissionId,
          status: PERMISSION_REQUEST_STATUS.PENDING,
        },
        select: {
          id: true,
        },
      }),
    ]);

  if (!permission) {
    return Response.json(
      {
        error: "not_found",
        message: "The selected permission could not be found.",
      },
      { status: 404 }
    );
  }

  if (existingAssignment) {
    return Response.json(
      {
        error: "already_assigned",
        message: "You already have this permission.",
      },
      { status: 409 }
    );
  }

  if (existingPendingRequest) {
    return Response.json(
      {
        error: "duplicate_request",
        message: "A pending request already exists for this permission.",
      },
      { status: 409 }
    );
  }

  await prisma.permissionRequest.create({
    data: {
      userId: session.user.id,
      permissionId,
      reason,
      status: PERMISSION_REQUEST_STATUS.PENDING,
    },
  });

  await createActivityEvent({
    eventType: ACTIVITY_EVENT_TYPES.PERMISSION_REQUEST_CREATED,
    actorId: session.user.id,
    actorName: session.user.name,
    subjectUserId: session.user.id,
    subjectName: session.user.name,
    entityType: "permission_request",
    entityId: permissionId,
    title: "Permission request submitted",
    description: `${session.user.name} requested ${permission.name}.`,
  });

  return Response.json({
    message: `Permission request for ${permission.name} submitted successfully.`,
  });
}
