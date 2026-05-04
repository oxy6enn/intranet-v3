import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermissionApiSession } from "@/lib/admin-api";
import { PERMISSION_CODES } from "@/lib/permission-codes";

const updateUserPermissionsSchema = z.object({
  permissionIds: z.array(z.string()),
});

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, { params }: Params) {
  const authResult = await requirePermissionApiSession(
    request,
    PERMISSION_CODES.PERMISSION_MANAGE
  );

  if (!authResult.ok) {
    return authResult.response;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateUserPermissionsSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "validation_error",
        message: "ข้อมูลสิทธิ์ที่ส่งมาไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!targetUser) {
    return Response.json(
      {
        error: "user_not_found",
        message: "ไม่พบผู้ใช้ที่ต้องการจัดสิทธิ์",
      },
      { status: 404 }
    );
  }

  const permissions = await prisma.permission.findMany({
    where: {
      id: {
        in: parsed.data.permissionIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (permissions.length !== parsed.data.permissionIds.length) {
    return Response.json(
      {
        error: "permission_not_found",
        message: "มี permission บางรายการไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.userPermission.deleteMany({
      where: {
        userId: id,
      },
    });

    if (parsed.data.permissionIds.length) {
      await tx.userPermission.createMany({
        data: parsed.data.permissionIds.map((permissionId) => ({
          userId: id,
          permissionId,
          createdBy: authResult.session.user.id,
        })),
      });
    }
  });

  return Response.json({
    success: true,
    message: "อัปเดตสิทธิ์รายคนสำเร็จ",
  });
}
