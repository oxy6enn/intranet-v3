import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth";
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

  return (
    <DashboardShell
      name={session.user.name}
      email={session.user.email}
      status={session.user.status}
      role={session.user.role}
    />
  );
}
