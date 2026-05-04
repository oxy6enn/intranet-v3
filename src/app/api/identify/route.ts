import { z } from "zod";
import {
  ACTIVITY_EVENT_TYPES,
  createActivityEvent,
} from "@/lib/activity-events";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTemporaryPassword } from "@/lib/temp-password";
import { USER_STATUS } from "@/lib/user-status";

const identifySchema = z.object({
  employee_code: z.string().min(1),
  temporary_password: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return Response.json(
      {
        error: "unauthorized",
        message: "กรุณาเข้าสู่ระบบก่อนยืนยันตัวตน",
      },
      { status: 401 }
    );
  }

  if (session.user.status !== USER_STATUS.PENDING_IDENTIFY) {
    return Response.json(
      {
        error: "invalid_status",
        message: "บัญชีนี้ไม่ได้อยู่ในสถานะที่ต้องยืนยันตัวตนแล้ว",
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = identifySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "validation_error",
        message: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  const { employee_code, temporary_password } = parsed.data;

  const employee = await prisma.employee.findUnique({
    where: {
      employeeCode: employee_code,
    },
  });

  if (!employee) {
    return Response.json(
      {
        error: "employee_not_found",
        message: "ไม่พบรหัสพนักงานนี้ในระบบ",
      },
      { status: 404 }
    );
  }

  if (
    employee.isClaimed &&
    employee.claimedUserId &&
    employee.claimedUserId !== session.user.id
  ) {
    return Response.json(
      {
        error: "employee_already_claimed",
        message: "รหัสพนักงานนี้ถูกผูกกับผู้ใช้อื่นแล้ว",
      },
      { status: 409 }
    );
  }

  if (
    employee.tempPasswordExpiresAt &&
    employee.tempPasswordExpiresAt.getTime() < Date.now()
  ) {
    return Response.json(
      {
        error: "temporary_password_expired",
        message: "รหัสผ่านชั่วคราวหมดอายุแล้ว",
      },
      { status: 400 }
    );
  }

  const isValidPassword = verifyTemporaryPassword(
    temporary_password,
    employee.tempPasswordHash
  );

  if (!isValidPassword) {
    return Response.json(
      {
        error: "temporary_password_invalid",
        message: "รหัสผ่านชั่วคราวไม่ถูกต้อง",
      },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          status: true,
        },
      });

      if (!currentUser || currentUser.status !== USER_STATUS.PENDING_IDENTIFY) {
        throw new Error("USER_STATUS_CHANGED");
      }

      const currentEmployee = await tx.employee.findUnique({
        where: {
          id: employee.id,
        },
      });

      if (!currentEmployee) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }

      if (
        currentEmployee.tempPasswordExpiresAt &&
        currentEmployee.tempPasswordExpiresAt.getTime() < Date.now()
      ) {
        throw new Error("TEMP_PASSWORD_EXPIRED");
      }

      if (
        currentEmployee.isClaimed &&
        currentEmployee.claimedUserId &&
        currentEmployee.claimedUserId !== session.user.id
      ) {
        throw new Error("EMPLOYEE_ALREADY_CLAIMED");
      }

      await tx.employee.update({
        where: {
          id: currentEmployee.id,
        },
        data: {
          isClaimed: true,
          claimedUserId: session.user.id,
        },
      });

      await tx.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          status: USER_STATUS.ACTIVE,
        },
      });
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "UNKNOWN_IDENTIFY_ERROR";

    if (message === "USER_STATUS_CHANGED") {
      return Response.json(
        {
          error: "user_status_changed",
          message: "สถานะผู้ใช้เปลี่ยนระหว่างทำรายการ กรุณาลองใหม่อีกครั้ง",
        },
        { status: 409 }
      );
    }

    if (message === "EMPLOYEE_NOT_FOUND") {
      return Response.json(
        {
          error: "employee_not_found",
          message: "ไม่พบข้อมูลพนักงานที่ต้องการยืนยันตัวตน",
        },
        { status: 404 }
      );
    }

    if (message === "EMPLOYEE_ALREADY_CLAIMED") {
      return Response.json(
        {
          error: "employee_already_claimed",
          message: "รหัสพนักงานนี้ถูกผูกกับผู้ใช้อื่นแล้ว",
        },
        { status: 409 }
      );
    }

    if (message === "TEMP_PASSWORD_EXPIRED") {
      return Response.json(
        {
          error: "temporary_password_expired",
          message: "รหัสผ่านชั่วคราวหมดอายุแล้ว",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        error: "identify_failed",
        message: "เกิดข้อผิดพลาดระหว่างยืนยันตัวตน กรุณาลองใหม่อีกครั้ง",
      },
      { status: 500 }
    );
  }

  await createActivityEvent({
    eventType: ACTIVITY_EVENT_TYPES.IDENTIFY_COMPLETED,
    actorId: session.user.id,
    actorName: session.user.name,
    subjectUserId: session.user.id,
    subjectName: session.user.name,
    entityType: "employee",
    entityId: employee.employeeCode,
    title: "Employee identity verified",
    description: `${session.user.name} linked employee code ${employee.employeeCode} successfully.`,
  });

  return Response.json({
    success: true,
    message: "ยืนยันตัวตนสำเร็จ",
  });
}
