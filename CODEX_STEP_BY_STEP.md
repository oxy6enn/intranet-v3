# Codex Step-by-Step Prompt

คุณคือ AI coding tutor ช่วยพาผมสร้างระบบ Authentication สำหรับเว็บแอปภายในหน่วยงานราชการ/องค์กรปกครองส่วนท้องถิ่น

## 0. Tech Stack

ใช้เทคโนโลยีนี้เท่านั้น:

- Next.js 14+ App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Better Auth
- PostgreSQL
- Prisma ORM
- MinIO S3 Compatible Storage
- TanStack Table
- React Hook Form
- Zod
- Docker Compose

### หมายเหตุสำคัญเรื่อง Prisma ORM รุ่นใหม่

- ถ้าใช้ Prisma 7+ ให้ใช้ `prisma.config.ts` สำหรับ `DATABASE_URL`
- ห้ามใส่ `datasource.url` ไว้ใน `schema.prisma`
- ให้กำหนด `generator client` แบบมี `output`
- ถ้าใช้ PostgreSQL runtime ให้ใช้ `@prisma/adapter-pg` และ `pg`

### หมายเหตุสำคัญเรื่อง Better Auth

- Better Auth เก็บ password ของ email/password ไว้ใน `Account.password` ไม่ใช่ใน `User`
- `User` ต้องมี core fields ของ Better Auth เช่น `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`
- field อย่าง `role` และ `status` ให้เพิ่มผ่าน `user.additionalFields`
- ต้องมี `Session`, `Account`, `Verification` ใน Prisma schema ด้วย

## 1. Main Auth Concept

ระบบต้องใช้แนวทางนี้:

```text
Email/Password → Identify Employee → Active User → Link Social Provider
```

### ห้ามทำ

- ห้ามให้ผู้ใช้ login ด้วย Google / LINE / ThaiD ตั้งแต่แรก
- ห้ามให้ social login เป็นวิธีสมัครหลัก
- ห้ามให้ผู้ใช้กรอกชื่อ ตำแหน่ง แผนกเองในหน้า identify
- ห้ามเก็บ temporary password แบบ plain text

### ต้องทำ

- สมัครด้วย email/password ก่อน
- หลังสมัครให้ user มีสถานะ `pending_identify`
- redirect ไป `/identify`
- identify ด้วย `employee_code` + `temporary_password`
- ถ้าผ่านแล้วให้ user เป็น `active`
- หลัง active แล้วค่อยให้ link social provider ที่ `/profile/security`

## 2. Roles

ใช้ role หลัก:

```text
super_admin
admin
user
```

`guest` ไม่ต้องเก็บใน database เพราะหมายถึงคนที่ยังไม่ login

### สิทธิ์

```text
super_admin = ทำได้ทุกอย่าง
admin       = ทำได้ตาม permission ที่ super_admin กำหนด
user        = สิทธิ์พื้นฐาน + permission เสริมรายคน
guest       = public pages เท่านั้น
```

## 3. Database Models

ก่อนสร้าง model ให้ยึดแนวทางนี้สำหรับ Prisma 7+:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

ให้ใช้ block นี้เป็นฐานของ `prisma/schema.prisma` แล้วค่อยเพิ่ม model ต่อด้านล่าง

และให้มี `prisma.config.ts` ลักษณะนี้:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

และให้มี `src/lib/prisma.ts` ลักษณะนี้:

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

ให้สร้าง Prisma model เพิ่มเติมจาก Better Auth schema:

```prisma
enum UserStatus {
  pending_identify
  active
  suspended
}

enum Role {
  super_admin
  admin
  user
}

model Employee {
  id                    String   @id @default(cuid())
  employeeCode          String   @unique
  fullName              String
  position              String?
  department            String?
  tempPasswordHash      String
  tempPasswordExpiresAt DateTime?
  isClaimed             Boolean  @default(false)
  claimedUserId         String?  @unique
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model Permission {
  id          String   @id @default(cuid())
  code        String   @unique
  name        String
  description String?
  createdAt   DateTime @default(now())
}

model UserPermission {
  id           String   @id @default(cuid())
  userId       String
  permissionId String
  createdBy    String?
  createdAt    DateTime @default(now())

  @@unique([userId, permissionId])
}
```

ใน Better Auth user ต้องมี field เพิ่ม:

```text
role
status
```

## 4. Required Routes

### Public routes

```text
/
/login
/register
/news
/services
```

### Pending identify route

```text
/identify
```

### Active user routes

```text
/dashboard
/profile
/profile/security
```

### Admin routes

```text
/admin
/admin/employees
/admin/users
/admin/permissions
```

## 5. Middleware Rules

ให้สร้าง middleware ตาม logic นี้:

```text
ถ้าไม่ login → เข้าได้เฉพาะ public routes
ถ้า login แล้ว status = pending_identify → เข้าได้เฉพาะ /identify และ logout
ถ้า status = active → เข้า dashboard/profile ได้
ถ้า status = suspended → block dashboard และ admin routes
```

### แนวทาง implementation ที่ควรใช้

- ใช้ `middleware.ts`
- ถ้าใช้ Next.js 16+ ให้กำหนด `runtime: "nodejs"`
- ใช้ `auth.api.getSession({ headers: request.headers })`
- ให้ redirect ตาม status โดยไม่พึ่งแค่ cookie existence

## 6. Identify Logic

หน้า `/identify` ต้องมี form:

```text
employee_code
temporary_password
```

เมื่อ submit:

1. ตรวจว่า user login แล้ว
2. ตรวจว่า user.status = pending_identify
3. หา employee จาก employeeCode
4. ตรวจว่า employee ยังไม่ถูก claim
5. ตรวจว่า temporary password ถูกต้องด้วย hash compare
6. ตรวจวันหมดอายุ temporary password ถ้ามี
7. update employee:

```text
isClaimed = true
claimedUserId = session.user.id
```

8. update user:

```text
status = active
```

9. redirect ไป `/dashboard`

### แนวทาง implementation ที่ควรใช้

- ใช้ route handler `POST /api/identify`
- ใช้ `auth.api.getSession({ headers: request.headers })` เพื่อตรวจ session
- ใช้ helper แยกสำหรับ verify temporary password hash
- ใช้ Prisma transaction ตอน update `Employee` และ `User`
- ถ้า user active อยู่แล้ว ให้ redirect ออกจาก `/identify` ไป `/dashboard`

## 7. Social Linking

หลัง user.status = active เท่านั้น ให้แสดงหน้า:

```text
/profile/security
```

หน้านี้ให้มีปุ่ม:

```text
Link Google
Link LINE
Link ThaiD ในอนาคต
```

ให้ใช้ Better Auth `linkSocial` สำหรับ provider ที่รองรับ และเตรียม ThaiD ด้วย Generic OAuth / OIDC ในอนาคต

### แนวทาง implementation ที่ควรใช้

- สร้างหน้า `/profile/security`
- เช็ก session และ status = `active` ก่อนเข้าหน้านี้
- query ตาราง `Account` เพื่อดูว่า provider ไหนถูก link แล้ว
- ใช้ `authClient.linkSocial({ provider, callbackURL: "/profile/security" })`
- เปิด provider แบบ conditional จาก env เช่น `GOOGLE_CLIENT_ID`, `LINE_CLIENT_ID`

## 8. Admin Employee Management

สร้างหน้า:

```text
/admin/employees
/admin/employees/create
/admin/employees/[id]/edit
```

Admin ต้องทำได้:

- เพิ่มพนักงาน
- กรอกรหัสพนักงาน
- กรอกชื่อ-นามสกุล
- กรอกตำแหน่ง
- กรอกแผนก/กอง/หน่วยงาน
- generate temporary password
- reset temporary password
- ดูว่า claimed แล้วหรือยัง

## 9. Forms

ทุก form ใช้:

```text
React Hook Form + Zod
```

Forms ที่ต้องมี:

- Register form
- Login form
- Identify form
- Create Employee form
- Edit Employee form
- Permission form

## 10. Development Phases

ให้ทำทีละ Phase และอธิบายก่อนเขียนโค้ดทุกครั้ง

### Phase 1 — Project Setup

- สร้าง Next.js App Router project
- ติดตั้ง Tailwind CSS
- ติดตั้ง shadcn/ui
- สร้าง Docker Compose สำหรับ PostgreSQL และ MinIO
- สร้าง `.env.example`

### Phase 2 — Prisma Setup

- ติดตั้ง Prisma
- เชื่อม PostgreSQL
- สร้าง `prisma.config.ts`
- สร้าง `src/lib/prisma.ts`
- สร้าง schema เริ่มต้น
- เพิ่ม Employee, Permission, UserPermission
- ตั้ง `generator client` ให้มี `output`
- ใช้ `@prisma/adapter-pg` สำหรับ runtime PostgreSQL
- เตรียม Better Auth user fields: role, status

### Phase 3 — Better Auth Setup

- ติดตั้ง Better Auth
- ตั้งค่า email/password
- สร้าง `src/lib/auth.ts`
- สร้าง auth route `/api/auth/[...all]/route.ts`
- สร้าง `src/lib/auth-client.ts`
- เพิ่ม `BETTER_AUTH_URL` และ `BETTER_AUTH_SECRET` ใน env
- generate schema ของ Better Auth แล้ว merge เข้ากับ Prisma schema หลัก
- สร้าง auth client
- ทดสอบ register/login/logout

### Phase 4 — Register/Login Pages

- สร้าง `/register`
- สร้าง `/login`
- ใช้ shadcn/ui
- ใช้ React Hook Form + Zod
- หลัง register redirect `/identify`

### Phase 5 — Identify

- สร้าง `/identify`
- สร้าง `/api/identify`
- verify employee_code + temporary_password
- ตรวจ session และ status จาก Better Auth ก่อนทำงาน
- ตรวจ claim ซ้ำและวันหมดอายุ temporary password
- ใช้ transaction ตอน update employee/user
- update status เป็น active

### Phase 6 — Middleware

- ป้องกัน route ตาม status
- pending_identify ห้ามเข้า dashboard
- active ห้ามกลับไป identify
- suspended เข้า dashboard/admin ไม่ได้
- admin route ต้องกัน role ตั้งแต่ชั้น middleware หรือ page guard

### Phase 7 — Admin Employee CRUD

- สร้างหน้า list employee ด้วย TanStack Table
- สร้างหน้า create employee
- สร้างหน้า edit employee
- generate temporary password
- hash password ก่อนบันทึก
- ให้ route ฝั่ง admin เช็ก role `admin`/`super_admin`

### Phase 8 — Permission System

- สร้าง Permission
- สร้าง UserPermission
- สร้าง helper `can(user, permission)`
- super_admin ผ่านทุกอย่าง

### Phase 9 — Social Linking

- สร้าง `/profile/security`
- แสดงเฉพาะ user active
- เพิ่มปุ่ม link Google/LINE
- เตรียม config ThaiD ด้วย Generic OAuth ในอนาคต
- ให้แสดงสถานะ linked / not configured / ready จากข้อมูลจริง

### Phase 10 — Review & Refactor

- ตรวจความปลอดภัย
- ตรวจ naming
- ตรวจ validation
- ตรวจ middleware
- ตรวจ Prisma relation

## 11. Coding Style

- เขียน TypeScript ให้ชัดเจน
- แยกไฟล์ logic ออกจาก UI
- ใช้ server actions หรือ route handlers ตามความเหมาะสม
- เขียน comment เฉพาะจุดที่เข้าใจยาก
- อธิบายโค้ดเป็นภาษาไทยแบบ beginner-friendly

## 12. Final Summary

ระบบนี้ต้องยึดแนวคิด:

```text
Better Auth = Login
Employee = Identity ภายในหน่วยงาน
Permission = Authorization
Social Provider = Login method เสริมหลัง active
```

## 13. Flow Update: Register / Login / Identify

- ให้หน้า `/register` และ `/login` เช็ก session ฝั่ง server ด้วย `auth.api.getSession({ headers: await headers() })`
- ถ้า status = `pending_identify` ให้ redirect ไป `/identify` ทันที เพื่อรองรับกรณีผู้ใช้กดย้อนกลับหลังสมัครเสร็จ
- ถ้า status = `active` ให้ redirect ไป `/dashboard`
- ถ้า status = `suspended` ให้ redirect ไป `/suspended`
- หน้า `/identify` ต้องแสดง `session.user.email` เพื่อบอกให้ผู้ใช้เห็นว่ากำลังยืนยันตัวตนของบัญชีใดอยู่

## 14. E2E Troubleshooting

- ถ้า `npm run test:e2e:headed` เปิด browser ไม่ได้และขึ้น `spawn EPERM` ให้จดไว้ก่อนว่านี่อาจเป็นข้อจำกัดของ sandbox หรือ remote environment ไม่ใช่ bug ของแอปโดยตรง
- ให้ลองรันคำสั่งเดิมบนเครื่อง local ก่อน เพราะ Playwright ต้อง spawn browser process จริง
- ถ้า register หรือ login ไม่ redirect ทั้งที่กรอกข้อมูลถูก ให้เช็ก host ใน `playwright.config.ts` กับ `.env` ให้ตรงกัน โดยเฉพาะ `BETTER_AUTH_URL`
- กรณีนี้เราเคยเจอว่า `127.0.0.1` กับ `localhost` ทำให้ auth cookie/origin ไม่ตรงกัน สุดท้ายต้องเปลี่ยน Playwright ให้ใช้ `http://localhost:3000`
- ถ้า browser ไปค้างที่ URL แบบ `/register?name=...&email=...` ให้ตีความว่า native form submit ยิงก่อน React hydrate
- แนวแก้ที่ใช้ได้จริงในโปรเจกต์นี้คือเปลี่ยนปุ่ม submit ของ auth forms เป็น `type="button"` แล้วเรียก `form.handleSubmit(onSubmit)()` ผ่าน `onClick`
- อย่าพึ่งรอ hydration ด้วย selector ที่เปราะบางเกินไป เช่นรอ `<html>` ให้ visible เพราะไม่ได้ช่วยเสมอไปและอาจทำให้ test timeout
- ให้เพิ่ม `data-testid` กับปุ่มหรือ field สำคัญ แล้วใช้ Playwright จับ element เหล่านั้นโดยตรง
- ถ้า test fail เพราะ user ทดสอบเคยสมัครไปแล้ว หรือ employee ถูก claim ไปแล้ว ให้รีเซ็ตข้อมูลใน `e2e/global-setup.ts`
- ตอน debug ให้เปิดโหมด `headed` และดูไฟล์ใน `test-results/` เช่น screenshot, video, และ `error-context.md` ควบคู่กัน

## 15. E2E Coverage

- ให้เพิ่ม Playwright e2e อย่างน้อย 7 flows ต่อไปนี้
- `auth-flow.spec.ts`
  ทดสอบ `register -> identify -> dashboard -> logout -> login`
- `admin-employees.spec.ts`
  ทดสอบ admin สร้าง employee record
- `admin-permissions.spec.ts`
  ทดสอบ admin สร้าง permission record
- `admin-user-permissions.spec.ts`
  ทดสอบ admin assign direct permission ให้ user
- `admin-access.spec.ts`
  ทดสอบว่า active user ที่ไม่ใช่ admin ถูก redirect ออกจาก `/admin/*`
- `pending-access.spec.ts`
  ทดสอบว่า user ที่ยัง `pending_identify` ถูก redirect ออกจาก `/dashboard` กลับ `/identify`
- `suspended-access.spec.ts`
  ทดสอบว่า user ที่ถูกตั้งสถานะ `suspended` ถูก redirect ไป `/suspended`
- ให้จัดหมวดในใจเป็น 2 กลุ่ม: happy paths และ access-control paths
- ถ้ารันบน Windows ให้ใช้ production server สำหรับ e2e แทน `next dev`
- ให้ `npm run test:e2e` และ `npm run test:e2e:headed` build ก่อนอัตโนมัติ แล้วเปิด `next start -p 3000`
- ให้ Playwright ใช้ `workers: 1` เพื่อให้ suite เสถียรขึ้นระหว่าง auth flow และ browser automation

## 16. UI Redesign Direction

- ถ้าจะ redesign UI ให้ยึดแนวทาง `default shadcn/ui` เป็นฐานก่อน
- สามารถใช้ reference style จาก `shadcnblocks` ได้ โดยเฉพาะ:
  - landing page แบบโปร่งและมี spacing เยอะ
  - auth page แบบ centered form
  - dashboard แบบ app shell + sidebar
  - admin table แบบ data-product layout
- เวลาปรับ UI ห้ามทำลาย flow หลักของระบบ และควรรักษา selector ที่ e2e ใช้อยู่ เช่น `data-testid`
- หลัง redesign ทุกครั้งให้ตรวจอย่างน้อย:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e:headed`

## 17. Thai Font And Encoding

- ให้ใช้ `Anuphan` เป็นฟอนต์หลักของระบบก่อน `Inter`
- toast notifications ต้องใช้ฟอนต์ไทยตาม global font stack ด้วย
- ถ้าเห็นข้อความไทยเพี้ยนเป็น `เธ...` อย่าพึ่งสรุปว่าเป็นปัญหา font
- ให้ตรวจ source text ในไฟล์ก่อน เพราะมักเป็นอาการ mojibake หรือ encoding เพี้ยน
- ถ้าพบข้อความลักษณะนี้ใน `src/` ให้แก้ที่ตัว source โดยตรง แล้วค่อยตรวจซ้ำด้วย `rg "เธ" src`
- หลังแก้ encoding หรือ copy ไทยแล้ว ให้รัน e2e ซ้ำเพื่อยืนยันว่า UI ที่เปลี่ยนยังไม่ทำให้ flow พัง

## 18. Git And Commit Policy

- เมื่อทำ feature เสร็จเป็น section ให้ commit แยกตาม feature ทันที
- อย่ารวมหลาย feature ที่ไม่เกี่ยวกันไว้ใน commit เดียว
- ก่อน commit ให้ตรวจอย่างน้อย:
  - `npm run lint`
  - `npm run build`
  - ถ้า feature กระทบ flow หลัก ให้รัน e2e ที่เกี่ยวข้อง
- ให้ใช้ repository นี้เป็น remote หลักของงาน:
  - `https://github.com/oxy6enn/intranet-v3.git`
- รูปแบบ commit message ที่แนะนำ:
  - `feat: ...`
  - `fix: ...`
  - `test: ...`
  - `docs: ...`

## 19. Permission Request Workflow

- เพิ่ม feature จริงตัวถัดไปหลังจาก auth/admin foundations เสร็จแล้ว:
  - user สามารถขอ permission เพิ่มได้
  - admin สามารถ approve / reject คำขอได้
- โครงที่ต้องเพิ่มอย่างน้อย:
  - Prisma model `PermissionRequest`
  - หน้า `/permissions/request`
  - หน้า `/admin/permission-requests`
  - API สำหรับ create request
  - API สำหรับ review request
- กติกาหลักของ flow:
  - เฉพาะ user `active` เท่านั้นที่ขอสิทธิ์ได้
  - ถ้ามี `UserPermission` อยู่แล้ว ห้ามขอซ้ำ
  - ถ้ามี request `pending` อยู่แล้ว ห้ามขอซ้ำ
  - ถ้า admin approve ให้สร้าง `UserPermission` ทันที
  - ถ้า admin reject ให้เก็บ review note ได้
- dashboard ควรเชื่อมกับ flow นี้ด้วย เช่น quick access และ pending request count

## 20. E2E Coverage Update

- หลังเพิ่ม permission request flow แล้ว ให้เพิ่ม Playwright test อีก 1 flow:
  - user request permission
  - admin approve permission request
  - direct assignment ปรากฏใน `/admin/users`
- เมื่อเสร็จ suite ควรเพิ่มจาก `7` เป็น `8` flows

## 21. Dashboard With Real Data

- หลังจาก auth, admin, และ permission request flow เริ่มนิ่งแล้ว ให้เริ่มแทนค่าคงที่ใน dashboard ด้วยข้อมูลจริงจากฐานข้อมูล
- ตัวอย่างข้อมูลที่ควรดึง:
  - direct permissions ของ user
  - permission request stats
  - recent requests
  - linked employee summary
  - admin snapshot ถ้าเป็น admin
- เป้าหมายของ phase นี้คือทำให้ dashboard เป็นจุดสรุปสถานะของ account และ workflow ปัจจุบันจริง ไม่ใช่แค่หน้าต้อนรับ

## 22. Admin Request Insights

- หลังมี permission request flow แล้ว ให้ต่อยอดหน้า `/admin/permission-requests` จาก inbox ธรรมดาเป็นหน้า insight สำหรับ admin
- ตัวอย่าง insight ที่ควรเพิ่ม:
  - approval rate
  - top requested permissions
  - most active requesters
  - latest review activity
  - reviewer context ต่อ request
- แนวคิดคือให้ admin ตัดสินใจเรื่องการอนุมัติสิทธิ์ได้ดีขึ้นจากข้อมูลจริงในหน้าเดียว

## 23. Notification Center

- หลังจากมี dashboard real data และ admin insights แล้ว ให้เพิ่มหน้า `/notifications`
- หน้านี้ควรเป็นจุดรวม “สิ่งที่ต้องสนใจตอนนี้” มากกว่าการเป็นประวัติทั้งหมด
- ตัวอย่างข้อมูลที่ควรแสดง:
  - user request updates
  - review notes จาก admin
  - pending review queue สำหรับ admin
  - recent review decisions
- ปุ่ม `Bell` ใน dashboard ควร link มาที่หน้านี้ และมี badge count จากข้อมูลจริง

