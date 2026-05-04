import { prisma } from "@/lib/prisma";
import { requirePermissionApiSession } from "@/lib/admin-api";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { permissionSchema } from "@/lib/permission-form-schema";

export async function POST(request: Request) {
  const authResult = await requirePermissionApiSession(
    request,
    PERMISSION_CODES.PERMISSION_MANAGE
  );

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = await request.json();
  const parsed = permissionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "validation_error",
        message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const existingPermission = await prisma.permission.findUnique({
    where: {
      code: parsed.data.code,
    },
  });

  if (existingPermission) {
    return Response.json(
      {
        error: "permission_exists",
        message: "permission code นี้ถูกใช้แล้ว",
      },
      { status: 409 }
    );
  }

  await prisma.permission.create({
    data: parsed.data,
  });

  return Response.json({
    success: true,
    message: "สร้าง permission สำเร็จ",
  });
}
