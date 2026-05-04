import { auth } from "@/lib/auth";
import { canByUserId } from "@/lib/permissions";
import { USER_STATUS } from "@/lib/user-status";
import { isAdminRole } from "@/lib/user-role";
import type { PermissionCode } from "@/lib/permission-codes";

type AdminApiResult =
  | {
      ok: true;
      session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
    }
  | { ok: false; response: Response };

export async function requireAdminApiSession(
  request: Request
): Promise<AdminApiResult> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "unauthorized",
          message: "กรุณาเข้าสู่ระบบก่อน",
        },
        { status: 401 }
      ),
    };
  }

  if (session.user.status === USER_STATUS.SUSPENDED) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "suspended",
          message: "บัญชีนี้ถูกระงับการใช้งาน",
        },
        { status: 403 }
      ),
    };
  }

  if (session.user.status !== USER_STATUS.ACTIVE) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "invalid_status",
          message: "ต้องยืนยันตัวตนพนักงานให้เรียบร้อยก่อน",
        },
        { status: 403 }
      ),
    };
  }

  if (!isAdminRole(session.user.role)) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "forbidden",
          message: "คุณไม่มีสิทธิ์จัดการข้อมูลพนักงาน",
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    session,
  };
}

export async function requirePermissionApiSession(
  request: Request,
  permissionCode: PermissionCode
): Promise<AdminApiResult> {
  const authResult = await requireAdminApiSession(request);

  if (!authResult.ok) {
    return authResult;
  }

  const allowed = await canByUserId(authResult.session.user.id, permissionCode);

  if (!allowed) {
    return {
      ok: false,
      response: Response.json(
        {
          error: "forbidden",
          message: "คุณไม่มี permission ที่ต้องใช้สำหรับการทำรายการนี้",
        },
        { status: 403 }
      ),
    };
  }

  return authResult;
}
