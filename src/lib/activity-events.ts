import { prisma } from "@/lib/prisma";

export const ACTIVITY_EVENT_TYPES = {
  IDENTIFY_COMPLETED: "identify.completed",
  PERMISSION_REQUEST_CREATED: "permission_request.created",
  PERMISSION_REQUEST_APPROVED: "permission_request.approved",
  PERMISSION_REQUEST_REJECTED: "permission_request.rejected",
} as const;

type ActivityEventType =
  (typeof ACTIVITY_EVENT_TYPES)[keyof typeof ACTIVITY_EVENT_TYPES];

type CreateActivityEventInput = {
  eventType: ActivityEventType;
  actorId?: string | null;
  actorName?: string | null;
  subjectUserId?: string | null;
  subjectName?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  title: string;
  description: string;
};

export async function createActivityEvent(input: CreateActivityEventInput) {
  await prisma.activityEvent.create({
    data: {
      eventType: input.eventType,
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? null,
      subjectUserId: input.subjectUserId ?? null,
      subjectName: input.subjectName ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      title: input.title,
      description: input.description,
    },
  });
}
