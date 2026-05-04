import { prisma } from "@/lib/prisma";
import { requirePermissionApiSession } from "@/lib/admin-api";
import { createEmployeeSchema } from "@/lib/employee-form-schema";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { hashTemporaryPassword } from "@/lib/temp-password";

export async function POST(request: Request) {
  const authResult = await requirePermissionApiSession(
    request,
    PERMISSION_CODES.EMPLOYEE_CREATE
  );

  if (!authResult.ok) {
    return authResult.response;
  }

  const body = await request.json();
  const parsed = createEmployeeSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "validation_error",
        message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const existingEmployee = await prisma.employee.findUnique({
    where: {
      employeeCode: data.employeeCode,
    },
  });

  if (existingEmployee) {
    return Response.json(
      {
        error: "employee_code_exists",
        message: "รหัสพนักงานนี้ถูกใช้แล้ว",
      },
      { status: 409 }
    );
  }

  await prisma.employee.create({
    data: {
      employeeCode: data.employeeCode,
      fullName: data.fullName,
      position: data.position,
      department: data.department,
      tempPasswordHash: hashTemporaryPassword(data.temporaryPassword),
      tempPasswordExpiresAt: data.tempPasswordExpiresAt
        ? new Date(data.tempPasswordExpiresAt)
        : null,
    },
  });

  return Response.json({
    success: true,
    message: "สร้างข้อมูลพนักงานสำเร็จ",
  });
}
