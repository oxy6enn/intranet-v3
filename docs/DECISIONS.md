# Architectural Decisions

ไฟล์นี้ใช้บันทึก “เราตัดสินใจอะไรไปแล้ว และทำไม” เพื่อให้กลับมาอ่านย้อนหลังได้ง่าย โดยเฉพาะเวลาระบบโตขึ้นหรือมีคนใหม่เข้ามาดูโปรเจกต์

## 1. Auth Starts With Email/Password Only

การตัดสินใจ:

- ใช้ `email/password` เป็นจุดเริ่มต้นของการสมัครและ login

เหตุผล:

- ต้องแยก `authentication` ออกจาก `employee identity`
- ลดความซับซ้อนของ onboarding รอบแรก
- ทำให้ flow `pending_identify -> active` ชัดเจน

ผลกระทบ:

- social login ไม่ถูกใช้เป็นวิธีสมัครหลัก
- Google / LINE / ThaiD ถูกวางไว้เป็น `link provider after active`

## 2. Employee Identity Is A Separate Step

การตัดสินใจ:

- หลังสมัครแล้ว ผู้ใช้ต้องผ่านหน้า `/identify` ด้วย `employee_code + temporary_password`

เหตุผล:

- user account ไม่ได้แปลว่าเป็นพนักงานจริงทันที
- ข้อมูลพนักงานต้องมาจาก admin-controlled source
- รองรับองค์กรที่มีข้อมูล employee ล่วงหน้าอยู่แล้ว

ผลกระทบ:

- สถานะผู้ใช้มี `pending_identify`
- middleware และ route guards ต้องรู้จัก flow นี้

## 3. Authorization Uses Role Plus Direct Permissions

การตัดสินใจ:

- ใช้ทั้ง `role` และ `direct permissions`

เหตุผล:

- role อย่างเดียวหยาบเกินไป
- permission อย่างเดียวอาจดูแลยากในบางกรณี
- การผสมกันทำให้แยก “กลุ่มผู้ใช้” กับ “สิทธิ์เฉพาะงาน” ได้ดีขึ้น

ผลกระทบ:

- มี `Permission` และ `UserPermission`
- route/api guards ต้องรองรับทั้ง role และ permission checks

## 4. Permission Escalation Uses Request Workflow

การตัดสินใจ:

- ผู้ใช้ขอสิทธิ์เพิ่มผ่าน `permission request workflow` แทนการให้ admin assign ทุกอย่างแบบ manual only

เหตุผล:

- ทำให้ระบบมี self-service path
- ช่วยเก็บ review context, reason, reviewer note
- รองรับ audit และ activity timeline ได้ดีขึ้น

ผลกระทบ:

- มี `PermissionRequest`
- ต้องมี admin review inbox
- dashboard, notifications, activity log ใช้ข้อมูลชุดนี้ร่วมกัน

## 5. Prisma Uses Modern Prisma 7 Structure

การตัดสินใจ:

- ใช้ `prisma.config.ts` สำหรับ `DATABASE_URL`
- ไม่ใส่ `datasource.url` ใน `schema.prisma`
- ใช้ generated client output ชัดเจน

เหตุผล:

- ให้ฐานโปรเจกต์ตรงกับแนวทาง Prisma รุ่นใหม่
- ลด technical debt ตั้งแต่ต้น

ผลกระทบ:

- เอกสารและตัวอย่างทั้งหมดอ้างอิง Prisma 7+
- runtime PostgreSQL ใช้ `@prisma/adapter-pg`

## 6. Better Auth Owns Account Credentials

การตัดสินใจ:

- ให้ Better Auth เก็บ password ของ email/password ใน `Account.password`

เหตุผล:

- ตรงตามโมเดลของ Better Auth
- ลดการออกแบบ schema ผิดแนว library

ผลกระทบ:

- `User` ถือ business identity fields
- auth tables หลักต้องมี `User`, `Session`, `Account`, `Verification`

## 7. UI Uses shadcn/ui As The Base System

การตัดสินใจ:

- ใช้ `default shadcn/ui` เป็นฐานของ component library

เหตุผล:

- maintain ง่าย
- consistency สูง
- ปรับ redesign ได้โดยไม่สูญเสียมาตรฐานของ form/card/table

ผลกระทบ:

- custom styling ทำแบบค่อยเป็นค่อยไป
- e2e selectors มีโอกาสรอดจาก redesign มากขึ้น

## 8. Search/Filter Happens On Client, Query Happens On Server

การตัดสินใจ:

- ให้ `page.tsx` query ข้อมูลจริงบน server
- แล้วส่งเข้า client view/workspace เพื่อทำ search/filter

เหตุผล:

- ไม่ต้องรีบสร้าง API เพิ่ม
- ยังรักษา SSR data loading ที่ชัดเจน
- interaction บนหน้าจอเร็วและ refactor ง่าย

ผลกระทบ:

- ใช้ pattern `server page + client workspace`
- เหมาะกับหน้า `/activity`, `/notifications`, `/admin/permission-requests`

## 9. E2E Uses Production Server On Windows

การตัดสินใจ:

- Playwright ใช้ production server ผ่าน `next start`
- build ก่อนรันเสมอ
- ใช้ `1 worker`

เหตุผล:

- ลดปัญหา Turbopack / dev-server / port contention บน Windows
- ทำให้ flow มีเสถียรภาพกว่า `next dev`

ผลกระทบ:

- `pretest:e2e` ต้อง build ก่อน
- troubleshooting หลักของ e2e ถูกผูกกับพอร์ต `3000` และ browser launch environment

## 10. Documents Live Under docs/

การตัดสินใจ:

- ใช้โครงเอกสารหลักแบบ:
  - `README.md`
  - `docs/ROADMAP.md`
  - `docs/LESSONS.md`
  - `docs/FEATURES.md`
  - `docs/TESTING.md`
  - `docs/DECISIONS.md`

เหตุผล:

- ลดความรกที่ root
- แยกหน้าที่ของเอกสารแต่ละแบบชัดเจน
- ทำให้ Codex และคนอ่านหา context ได้เร็วขึ้น

## 11. Feature Work Is Committed In Small Sections

การตัดสินใจ:

- เมื่อจบ feature เป็น section ให้ commit/push แยกตาม feature

เหตุผล:

- review ง่าย
- debug ย้อนง่าย
- เอกสารและ test ของ feature เดียวกันเดินไปพร้อมกันได้

ผลกระทบ:

- ก่อน commit ควรเช็ก `lint`, `build`, และ tests ที่เกี่ยวข้อง

## 12. ThaiD Is Deferred, Not Removed

การตัดสินใจ:

- ยังไม่ implement ThaiD ตอนนี้ แต่เตรียมโครง thinking ไว้

เหตุผล:

- ไม่ให้ auth flow แรกซับซ้อนเกินจำเป็น
- ยังเน้น foundation, permissions, requests, and operational visibility ก่อน

ผลกระทบ:

- docs ยังพูดถึง ThaiD ในฐานะ future extension
- social linking ปัจจุบันเน้น Google / LINE scaffold ก่อน

## How To Use This File

ให้อัปเดต `docs/DECISIONS.md` เมื่อ:

- มี architectural decision ใหม่
- เปลี่ยนแนวทางหลักของระบบ
- มี tradeoff สำคัญที่ควรบันทึกไว้ไม่ให้หายไปกับ chat history
