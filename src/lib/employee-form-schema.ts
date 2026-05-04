import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .max(255, "ข้อความยาวเกินไป")
  .optional()
  .transform((value) => value || undefined);

export const createEmployeeSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(2, "กรุณากรอกรหัสพนักงาน")
    .max(50, "รหัสพนักงานยาวเกินไป"),
  fullName: z
    .string()
    .trim()
    .min(2, "กรุณากรอกชื่อพนักงาน")
    .max(255, "ชื่อยาวเกินไป"),
  position: optionalText,
  department: optionalText,
  temporaryPassword: z
    .string()
    .min(8, "รหัสผ่านชั่วคราวต้องยาวอย่างน้อย 8 ตัวอักษร")
    .max(128, "รหัสผ่านชั่วคราวยาวเกินไป"),
  tempPasswordExpiresAt: z
    .string()
    .optional()
    .transform((value) => value || undefined),
});

export const updateEmployeeSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(2, "กรุณากรอกรหัสพนักงาน")
    .max(50, "รหัสพนักงานยาวเกินไป"),
  fullName: z
    .string()
    .trim()
    .min(2, "กรุณากรอกชื่อพนักงาน")
    .max(255, "ชื่อยาวเกินไป"),
  position: optionalText,
  department: optionalText,
  temporaryPassword: z
    .string()
    .max(128, "รหัสผ่านชั่วคราวยาวเกินไป")
    .optional()
    .transform((value) => value || undefined),
  tempPasswordExpiresAt: z
    .string()
    .optional()
    .transform((value) => value || undefined),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
