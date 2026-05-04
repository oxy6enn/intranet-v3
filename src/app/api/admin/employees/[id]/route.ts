import { prisma } from "@/lib/prisma";
import { requirePermissionApiSession } from "@/lib/admin-api";
import { updateEmployeeSchema } from "@/lib/employee-form-schema";
import { PERMISSION_CODES } from "@/lib/permission-codes";
import { hashTemporaryPassword } from "@/lib/temp-password";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const authResult = await requirePermissionApiSession(
    request,
    PERMISSION_CODES.EMPLOYEE_UPDATE
  );

  if (!authResult.ok) {
    return authResult.response;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateEmployeeSchema.safeParse(body);

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
      id,
    },
  });

  if (!existingEmployee) {
    return Response.json(
      {
        error: "employee_not_found",
        message: "ไม่พบพนักงานที่ต้องการแก้ไข",
      },
      { status: 404 }
    );
  }

  const duplicateEmployeeCode = await prisma.employee.findFirst({
    where: {
      employeeCode: data.employeeCode,
      NOT: {
        id,
      },
    },
  });

  if (duplicateEmployeeCode) {
    return Response.json(
      {
        error: "employee_code_exists",
        message: "รหัสพนักงานนี้ถูกใช้แล้ว",
      },
      { status: 409 }
    );
  }

  await prisma.employee.update({
    where: {
      id,
    },
    data: {
      employeeCode: data.employeeCode,
      fullName: data.fullName,
      position: data.position,
      department: data.department,
      tempPasswordHash: data.temporaryPassword
        ? hashTemporaryPassword(data.temporaryPassword)
        : existingEmployee.tempPasswordHash,
      tempPasswordExpiresAt: data.tempPasswordExpiresAt
        ? new Date(data.tempPasswordExpiresAt)
        : null,
    },
  });

  return Response.json({
    success: true,
    message: "อัปเดตข้อมูลพนักงานสำเร็จ",
  });
}
