import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canByUserId } from "@/lib/permissions";
import { USER_STATUS } from "@/lib/user-status";
import { isAdminRole } from "@/lib/user-role";
import type { PermissionCode } from "@/lib/permission-codes";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireActiveSession() {
  const session = await requireSession();

  if (session.user.status === USER_STATUS.SUSPENDED) {
    redirect("/suspended");
  }

  if (session.user.status === USER_STATUS.PENDING_IDENTIFY) {
    redirect("/identify");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireActiveSession();

  if (!isAdminRole(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}

export async function requirePermissionSession(permissionCode: PermissionCode) {
  const session = await requireAdminSession();

  const allowed = await canByUserId(session.user.id, permissionCode);

  if (!allowed) {
    redirect("/dashboard");
  }

  return session;
}
