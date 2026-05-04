import { z } from "zod";

export const permissionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "กรุณากรอกรหัส permission")
    .max(100, "รหัส permission ยาวเกินไป")
    .regex(
      /^[a-z0-9:-]+$/,
      "ใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข : และ -"
    ),
  name: z
    .string()
    .trim()
    .min(2, "กรุณากรอกชื่อ permission")
    .max(255, "ชื่อ permission ยาวเกินไป"),
  description: z
    .string()
    .trim()
    .max(500, "คำอธิบายยาวเกินไป")
    .optional()
    .transform((value) => value || undefined),
});

export type PermissionInput = z.infer<typeof permissionSchema>;
