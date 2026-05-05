import { ActivityLogView } from "@/components/activity/activity-log-view";
import { requireActiveSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/user-role";
import { getWorkspaceShellData } from "@/lib/workspace-shell-data";

export default async function ActivityPage() {
  const session = await requireActiveSession();
  const isAdmin = isAdminRole(session.user.role);
  const workspace = await getWorkspaceShellData(session.user);

  const where = isAdmin
    ? undefined
    : {
        OR: [
          {
            actorId: session.user.id,
          },
          {
            subjectUserId: session.user.id,
          },
        ],
      };

  const [events, totalEvents] = await Promise.all([
    prisma.activityEvent.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
    }),
    prisma.activityEvent.count({ where }),
  ]);

  return (
    <ActivityLogView
      workspace={workspace}
      isAdmin={isAdmin}
      totalEvents={totalEvents}
      events={events.map((event) => ({
        id: event.id,
        eventType: event.eventType,
        actorName: event.actorName,
        subjectName: event.subjectName,
        entityType: event.entityType,
        title: event.title,
        description: event.description,
        createdAtIso: event.createdAt.toISOString(),
        createdAtLabel: event.createdAt.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))}
    />
  );
}
