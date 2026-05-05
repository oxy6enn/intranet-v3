# Hands-on Lessons: จับมือทำระบบ Auth ทีละขั้น

ไฟล์นี้คือแผนเรียนสำหรับให้ Codex พาคุณทำทีละบท โดยแต่ละบทควรทำให้เสร็จ ทดสอบได้ แล้วค่อยไปบทถัดไป

## Lesson 1 — เข้าใจภาพรวมระบบ

เป้าหมาย:

- เข้าใจความต่างระหว่าง Auth, Identity, Authorization

สรุป:

```text
Auth = login ด้วย email/password
Identity = ยืนยันว่าเป็นพนักงานจริงด้วย employee_code + temporary_password
Authorization = ตรวจ role/permission
```

สิ่งที่ต้องถาม Codex:

```text
ช่วยอธิบาย flow Email/Password → Identify → Active → Link Social แบบคนพื้นฐาน PHP เข้าใจ
```

---

## Lesson 2 — สร้าง Project

เป้าหมาย:

- สร้าง Next.js App Router project
- รันหน้าแรกได้

คำสั่งตัวอย่าง:

```bash
npx create-next-app@latest internal-auth-app --typescript --tailwind --eslint --app
cd internal-auth-app
npm run dev
```

ถาม Codex:

```text
ช่วยตรวจโครงสร้าง Next.js App Router และอธิบายแต่ละโฟลเดอร์ให้ผมเข้าใจ
```

---

## Lesson 3 — Docker Compose

เป้าหมาย:

- รัน PostgreSQL และ MinIO ได้

ไฟล์ที่ต้องมี:

```text
docker-compose.yml
.env.example
```

ทดสอบ:

```bash
docker compose up -d
```

---

## Lesson 4 — Prisma

เป้าหมาย:

- เชื่อม PostgreSQL ด้วย Prisma
- สร้าง schema เบื้องต้น
- เข้าใจความต่างระหว่าง `schema.prisma` กับ `prisma.config.ts` ใน Prisma 7+

คำสั่ง:

```bash
npm install prisma @prisma/client
npx prisma generate
```

ข้อควรรู้:

- Prisma 7+ ไม่ให้ใส่ `datasource.url` ใน `schema.prisma` แล้ว
- ให้ย้าย `DATABASE_URL` ไปไว้ใน `prisma.config.ts`
- ควรกำหนด `generator client` แบบมี `output`
- ถ้าใช้ PostgreSQL ตอน runtime ให้ใช้ `@prisma/adapter-pg` กับ `pg`

ตัวอย่างไฟล์อ้างอิง:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

```ts
// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

```ts
// src/lib/prisma.ts
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

ถาม Codex:

```text
ช่วยเพิ่ม Prisma schema สำหรับ Employee, Permission, UserPermission ตามไฟล์ docs/ROADMAP.md
และช่วยตั้ง Prisma 7+ ให้ถูกต้องด้วย prisma.config.ts กับ PostgreSQL adapter
```

---

## Lesson 5 — Better Auth

เป้าหมาย:

- ติดตั้ง Better Auth
- เปิด email/password
- สร้าง route `/api/auth/[...all]`
- เข้าใจว่า password จะอยู่ใน `Account.password` ไม่ใช่ `User`

ไฟล์ที่ควรมี:

```text
src/lib/auth.ts
src/lib/auth-client.ts
src/app/api/auth/[...all]/route.ts
```

env ที่ควรมี:

```text
BETTER_AUTH_URL
BETTER_AUTH_SECRET
```

ถาม Codex:

```text
ช่วยติดตั้งและตั้งค่า Better Auth กับ Next.js App Router + Prisma โดยเปิด email/password เท่านั้นก่อน
```

---

## Lesson 6 — Register/Login UI

เป้าหมาย:

- สร้างหน้า register/login
- ใช้ shadcn/ui
- ใช้ React Hook Form + Zod

เงื่อนไข:

- หลัง register สำเร็จ redirect `/identify`
- ห้ามแสดง social login ในช่วงนี้

---

## Lesson 7 — Identify Page

เป้าหมาย:

- สร้างหน้า `/identify`
- กรอก employee_code + temporary_password
- ถ้าถูกต้อง update user เป็น active

ไฟล์ที่ควรมี:

```text
src/app/identify/page.tsx
src/app/api/identify/route.ts
src/lib/temp-password.ts
```

สิ่งที่ควรเรียนรู้ในบทนี้:

- การใช้ `auth.api.getSession()` ฝั่ง server เพื่อเช็ก session จริง
- การแยก helper สำหรับ verify temporary password hash
- การใช้ transaction เพื่อ update หลายตารางให้สำเร็จพร้อมกัน

กรณี error ที่ต้องรองรับ:

- ไม่พบรหัสพนักงาน
- temporary password ผิด
- temporary password หมดอายุ
- employee ถูกผูกกับ user อื่นแล้ว

---

## Lesson 8 — Middleware

เป้าหมาย:

- ป้องกัน route ตาม session และ status

ไฟล์ที่ควรมี:

```text
middleware.ts
src/app/suspended/page.tsx
```

Test cases:

```text
guest เข้า /dashboard → redirect /login
pending_identify เข้า /dashboard → redirect /identify
active เข้า /identify → redirect /dashboard
suspended เข้า /dashboard → block
```

---

## Lesson 9 — Admin Employees

เป้าหมาย:

- super_admin/admin เพิ่มพนักงานได้
- generate temporary password
- hash ก่อนบันทึก

สิ่งที่ต้องทำ:

```text
/admin/employees
/admin/employees/create
/admin/employees/[id]/edit
```

สิ่งที่ควรเรียนรู้ในบทนี้:

- การเช็ก role `admin` / `super_admin`
- การใช้ TanStack Table กับข้อมูลจาก Prisma
- การแยก create/edit form และ route handler สำหรับฝั่ง admin

---

## Lesson 10 — Permission

เป้าหมาย:

- สร้าง Permission
- เพิ่ม permission ให้ user รายคน
- สร้าง helper can()

ตัวอย่าง:

```ts
can(user, "employee:create")
can(user, "report:view")
```

---

## Lesson 11 — Profile Security / Link Social

เป้าหมาย:

- หลัง active แล้ว ผู้ใช้ผูก Google/LINE ได้เอง
- เตรียม ThaiD สำหรับอนาคต

ไฟล์ที่ควรมี:

```text
src/app/profile/page.tsx
src/app/profile/security/page.tsx
src/components/profile/social-link-buttons.tsx
src/lib/social-providers.ts
```

สิ่งที่ควรเรียนรู้ในบทนี้:

- การอ่าน linked provider จากตาราง `Account`
- การเปิด social provider ตาม env จริง
- การใช้ `authClient.linkSocial()` เพื่อเริ่ม flow เชื่อมบัญชี

ถาม Codex:

```text
ช่วยสร้างหน้า /profile/security สำหรับ link social provider ด้วย Better Auth linkSocial โดยให้แสดงเฉพาะ user ที่ active แล้ว
```

---

## Lesson 12 — Final Review

Checklist:

- Register ด้วย email/password ได้
- Login ได้
- pending_identify เข้า dashboard ไม่ได้
- Identify ผ่านแล้วเข้า dashboard ได้
- Employee 1 คน claim ได้แค่ 1 user
- Temporary password ไม่เก็บ plain text
- Social linking ใช้ได้หลัง active เท่านั้น
- role/permission ทำงานถูกต้อง

## Lesson Add-on: Flow Update After Register

สิ่งที่ควรเพิ่มจากบทเรียนเดิม:

- หน้า `/register` และ `/login` ไม่ควรเป็นแค่ public form แต่ต้องเช็ก session ฝั่ง server ด้วย
- ถ้าผู้ใช้สมัครแล้วอยู่สถานะ `pending_identify` จากนั้นกดย้อนกลับ ระบบควรพากลับ `/identify` อัตโนมัติ
- ถ้าผู้ใช้เป็น `active` แล้ว ควรเด้งไป `/dashboard`
- ถ้าผู้ใช้เป็น `suspended` ควรเด้งไป `/suspended`
- หน้า `/identify` ควรแสดงอีเมลของ `session.user.email` เพื่อช่วยลดความสับสนว่ากำลัง identify ของบัญชีใด

ตัวอย่างสิ่งที่ควรถาม Codex เพิ่ม:

```text
ช่วยปรับ flow หลังสมัครสมาชิกให้ลื่นขึ้น โดยให้หน้า /register และ /login เช็ก session แล้ว redirect ตาม status อัตโนมัติ และให้หน้า /identify แสดง email ของบัญชีที่กำลังยืนยันตัวตนอยู่ด้วย
```

---

## Lesson Add-on: Debug `npm run test:e2e:headed`

เป้าหมาย:

- เรียนรู้วิธีไล่ปัญหา Playwright จาก error จริง
- แยกให้ออกว่า error มาจาก test, app, auth config หรือ environment

สิ่งที่ควรรู้:

- `npm run test:e2e:headed` คือการรัน Playwright แบบเปิด browser จริงเพื่อดูการทำงานทีละ step
- ถ้าเจอ `spawn EPERM` ให้สงสัย environment ก่อน เพราะบาง sandbox ไม่อนุญาตให้เปิด browser process
- ถ้า Better Auth ใช้ `localhost` แต่ Playwright วิ่งไป `127.0.0.1` อาจทำให้ cookie และ origin mismatch จน flow auth ไม่ผ่าน
- ถ้า URL กลายเป็น `/register?...` หรือ `/login?...` หลังคลิก submit ให้สงสัย native form submit มาก่อน React hydrate
- ถ้าข้อมูลทดสอบเคยถูกใช้ไปแล้ว ให้รีเซ็ตผ่าน `e2e/global-setup.ts`

แนวทางแก้ที่ใช้จริงในโปรเจกต์นี้:

- ใช้ `http://localhost:3000` ใน `playwright.config.ts` ให้ตรงกับ `BETTER_AUTH_URL`
- ใช้ `data-testid` กับปุ่ม submit เพื่อให้ test จับ element ได้เสถียร
- เปลี่ยนปุ่มส่งฟอร์ม auth เป็น `type="button"` แล้วเรียก `form.handleSubmit(onSubmit)()` ผ่าน `onClick`
- ใช้โหมด headed เปิดดู browser จริง และตรวจ screenshot/video ใน `test-results/`

ถาม Codex:

```text
ช่วยเพิ่มคู่มือ debug กรณี npm run test:e2e:headed ไม่ผ่านให้หน่อย โดยสรุปสาเหตุที่พบบ่อย เช่น spawn EPERM, localhost กับ 127.0.0.1 ไม่ตรงกัน, native form submit ก่อน hydration, และวิธีดู test-results เพื่อไล่ปัญหา
```

---

## Lesson Add-on: E2E Coverage Summary

เป้าหมาย:

- เข้าใจว่าตอนนี้ e2e ของโปรเจกต์ครอบคลุม flow ไหนแล้ว
- ใช้ test suite เป็น safety net ก่อนค่อยไปปรับ UI หรือเพิ่ม feature ต่อ

flows ที่ควรมีในโปรเจกต์นี้:

- `auth-flow.spec.ts`
  register -> identify -> dashboard -> logout -> login
- `admin-employees.spec.ts`
  admin สร้าง employee record
- `admin-permissions.spec.ts`
  admin สร้าง permission record
- `admin-user-permissions.spec.ts`
  admin assign direct permission ให้ user
- `admin-access.spec.ts`
  active user ที่ไม่ใช่ admin ถูก redirect ออกจาก `/admin/*`
- `pending-access.spec.ts`
  pending user เข้า dashboard ไม่ได้ และต้องถูกพากลับ `/identify`
- `suspended-access.spec.ts`
  suspended user ต้องถูกพาไป `/suspended`

สิ่งที่ควรเข้าใจเพิ่ม:

- 5 flows แรกช่วยยืนยัน happy path และ admin management flow
- 2 flows หลังช่วยยืนยัน access control ของ middleware และสถานะผู้ใช้

สิ่งที่ควรรู้:

- บน Windows ควรใช้ production server สำหรับ e2e แทน `next dev`
- ให้ build ก่อนทุกครั้ง แล้วเปิด `next start -p 3000`
- Playwright ควรใช้ `1 worker` เพื่อให้ flow auth และ admin เสถียรกว่าเดิม

ถาม Codex:

```text
ช่วยสรุป e2e coverage ของโปรเจกต์นี้ให้หน่อย พร้อมอธิบายว่าแต่ละ spec กำลังพิสูจน์ flow อะไร และทำไมบน Windows เราถึงใช้ production server กับ 1 worker
```

---

## Lesson Add-on: UI Redesign With Safety Net

เป้าหมาย:

- redesign UI ตาม reference ได้โดยไม่ทำ flow หลักพัง
- ใช้ e2e เป็น safety net ระหว่างปรับหน้าตา

สิ่งที่ควรทำ:

- ปรับ landing, auth, dashboard, admin, profile ให้ไปใน visual language เดียวกัน
- ใช้ `default shadcn/ui` เป็นฐานก่อนค่อยเพิ่ม style จาก reference
- รักษา `id`, `name`, และ `data-testid` ของ element สำคัญ

ลำดับที่แนะนำ:

```text
ปรับ UI -> รัน lint/build -> รัน e2e -> ค่อย polish เพิ่ม
```

สิ่งที่ควรรู้:

- ถ้า test พังหลัง redesign ไม่ได้แปลว่า business logic พังเสมอไป บางครั้งเป็นแค่ selector ชนหลาย element หรือ text ซ้ำในหน้า
- ถ้า selector ชน strict mode ของ Playwright ให้เพิ่ม `data-testid` เฉพาะจุดแทนการจับด้วย text กว้าง ๆ

---

## Lesson Add-on: Thai Font And Encoding Debug

เป้าหมาย:

- แยกให้ออกว่าอาการตัวหนังสือเพี้ยนมาจากฟอนต์หรือมาจาก source text

สิ่งที่ควรจำ:

- ถ้าฟอนต์ไม่รองรับไทย มักเห็นตัว fallback แต่ข้อความยังอ่านออก
- ถ้า source text เพี้ยนจาก encoding มักเห็นข้อความลักษณะ `เธ...`

แนวทางตรวจ:

```text
1. เช็ก global font stack ว่า Anuphan ถูกวางเป็นฟอนต์หลักหรือไม่
2. เช็ก toast ว่าใช้ font stack เดียวกับระบบหรือไม่
3. ค้นหาใน source ด้วย rg "เธ" src
4. ถ้าพบ ให้แก้ข้อความในไฟล์ต้นทางโดยตรง
```

บทเรียนจากโปรเจกต์นี้:

- เราต้องแก้ทั้ง font stack และ source text พร้อมกัน
- หลังซ่อมข้อความไทยใน `src/` แล้ว e2e ทั้ง 7 flows ยังผ่านครบ

---

## Lesson Add-on: Commit By Feature

เป้าหมาย:

- แยกประวัติการพัฒนาให้ชัดตาม feature
- ทำให้ review, debug, และ revert ง่ายขึ้น

แนวทาง:

- เมื่อทำ feature เสร็จเป็นช่วง ๆ ให้ commit ทันที
- หนึ่ง feature ควรมี code, validation, และ test ที่เกี่ยวข้องครบก่อน commit
- ถ้า feature กระทบหลายส่วน เช่น UI + API + test + docs ให้รวมเป็น commit ชุดเดียวได้ ถ้ายังเป็น intent เดียวกัน

Checklist ก่อน commit:

```text
1. feature ใช้งานได้จริง
2. npm run lint ผ่าน
3. npm run build ผ่าน
4. ถ้ากระทบ flow สำคัญ ให้รัน e2e ที่เกี่ยวข้อง
```

Repository ที่ใช้:

```text
https://github.com/oxy6enn/intranet-v3.git
```

ตัวอย่าง commit message:

```text
feat: add admin permission dashboard summary
fix: resolve thai text encoding in profile pages
test: cover pending user access redirect
docs: update redesign and git workflow notes
```

---

## Lesson Add-on: Permission Request Flow

เป้าหมาย:

- ให้ผู้ใช้ที่เป็น `active` ขอ permission เพิ่มจาก role ปัจจุบันได้
- ให้ admin review และอนุมัติหรือปฏิเสธคำขอได้

สิ่งที่ต้องมีใน feature นี้:

- Prisma model `PermissionRequest`
- หน้า `/permissions/request`
- หน้า `/admin/permission-requests`
- API สำหรับส่งคำขอ
- API สำหรับ approve / reject

สิ่งที่ควรเรียนรู้จากรอบนี้:

- ความต่างระหว่าง `Permission` กับ `PermissionRequest`
- การใช้ transaction ตอน admin อนุมัติ เพื่อ update request และสร้าง `UserPermission` ให้สอดคล้องกัน
- การกัน duplicate request ด้วย business rules ไม่ใช่แค่ UI
- การต่อ dashboard ให้เป็น entry point ของ feature ใหม่

Checklist หลังทำเสร็จ:

```text
1. user active ส่ง request ได้
2. ถ้ามี permission อยู่แล้ว ขอซ้ำไม่ได้
3. ถ้ามี request pending อยู่แล้ว ขอซ้ำไม่ได้
4. admin approve แล้วเกิด direct permission จริง
5. admin reject แล้ว request เปลี่ยนสถานะจริง
6. e2e suite เพิ่มจาก 7 เป็น 8 flows
```

---

## Lesson Add-on: Dashboard With Real Data

เป้าหมาย:

- เปลี่ยน dashboard จากค่าตัวอย่างให้กลายเป็นหน้าสรุปข้อมูลจริงของผู้ใช้

สิ่งที่ควรดึงขึ้นมาแสดง:

- direct permissions
- request stats
- recent permission requests
- employee summary หลัง identify
- admin snapshot ถ้า user เป็น admin

สิ่งที่ควรเรียนรู้จากรอบนี้:

- การใช้ server component เป็นจุดรวม query หลายชุดจาก Prisma
- การ format ข้อมูลบน server ก่อนส่งเข้า client component
- การ redesign dashboard โดยไม่ทำให้ selector และ e2e flow เดิมพัง

---

## Lesson Add-on: Admin Request Insights

เป้าหมาย:

- ทำให้หน้า review request ของ admin มีคุณค่าเชิงตัดสินใจมากกว่าการกด approve/reject อย่างเดียว

สิ่งที่ควรเพิ่ม:

- approval rate
- top requested permissions
- latest review activity
- most active requesters
- reviewer context ในตาราง

สิ่งที่ควรเรียนรู้จากรอบนี้:

- การ derive analytics เบื้องต้นจากข้อมูลจริงโดยไม่ต้องมีระบบ BI แยก
- การออกแบบหน้า admin ให้เห็นทั้ง `queue` และ `insight` พร้อมกัน
- การขยายหน้าเดิมโดยไม่กระทบ e2e flow หลัก

---

## Lesson Add-on: Notification Center

เป้าหมาย:

- ทำให้ผู้ใช้และ admin มีจุดรวม “เรื่องที่ต้องสนใจตอนนี้” ในระบบ

สิ่งที่ควรมี:

- หน้า `/notifications`
- bell button ที่เชื่อมเข้าหน้านี้
- badge count จากข้อมูลจริง
- section แยกสำหรับ user updates และ admin queue

สิ่งที่ควรเรียนรู้จากรอบนี้:

- ความต่างระหว่าง `dashboard summary` กับ `notification center`
- การ reuse ข้อมูลจาก permission request flow ให้เกิด UX ใหม่
- การเพิ่ม route ใหม่โดยไม่ทำให้ e2e flow เดิมพัง

---

## Lesson Add-on: Activity Log

เป้าหมาย:

- ทำให้ระบบมี timeline กลางของเหตุการณ์สำคัญที่ดูย้อนหลังได้

สิ่งที่ควรมี:

- model `ActivityEvent`
- helper กลางสำหรับ create event
- หน้า `/activity`
- การ log จาก route สำคัญ เช่น identify และ permission review

สิ่งที่ควรเรียนรู้จากรอบนี้:

- ความต่างระหว่าง `notification` กับ `activity log`
- การเก็บ snapshot ใน event เพื่อไม่ให้ timeline พังเมื่อข้อมูลหลักเปลี่ยน
- การออกแบบ event schema ให้ขยายต่อได้ในอนาคต

---

## Lesson Add-on: Search And Filters

เป้าหมาย:

- ทำให้หน้าที่มีข้อมูลจริงเริ่มใช้งานได้คล่องขึ้น ไม่ใช่แค่แสดงรายการทั้งหมด

สิ่งที่ควรมี:

- search input สำหรับ keyword
- filter buttons หรือ tabs สำหรับ scope/status
- summary cards ที่สะท้อนผลลัพธ์หลัง filter
- การแยก server page กับ client view component ให้รับผิดชอบคนละชั้น

ตัวอย่างหน้าที่เหมาะกับ pattern นี้:

- `/activity`
- `/notifications`
- `/admin/permission-requests`

สิ่งที่ควรเรียนรู้จากรอบนี้:

- ความต่างระหว่าง `data loading` กับ `data interaction`
- การใช้ `useDeferredValue` เพื่อลดความกระตุกเวลา filter ข้อมูล
- การออกแบบหน้าแบบ “query on server, refine on client” เพื่อให้ต่อยอดง่ายและไม่เพิ่ม complexity ฝั่ง API เร็วเกินไป

---

## Lesson Add-on: Export And Reporting

เป้าหมาย:

- ทำให้ admin เอาข้อมูลที่เห็นบนหน้าจอไปใช้ต่อได้ทันที โดยไม่ต้องรอระบบ report เต็มรูปแบบ

สิ่งที่ควรมี:

- ปุ่ม export จากหน้า operation หลัก
- export ชุดข้อมูลที่ถูก filter อยู่จริง
- export summary สำหรับ insight ที่อ่านเร็ว

สิ่งที่ควรเรียนรู้จากรอบนี้:

- ความต่างระหว่าง `reporting UI` กับ `reporting backend`
- เมื่อไรที่ client-side CSV export เพียงพอ
- วิธี reuse filtered state เดิมให้เกิด feature ใหม่โดยไม่เพิ่ม API ก่อนเวลาอันควร

---

## Lesson Add-on: Advanced Filters

เป้าหมาย:

- ทำให้หน้าที่มีข้อมูลจริงใช้งานแบบ operational มากขึ้น ไม่ใช่แค่ search keyword อย่างเดียว

สิ่งที่ควรมี:

- date range presets
- custom from/to date
- summary cards ที่คำนวณจาก filtered result
- export/reporting ที่อิง filter เดียวกับหน้าจอ

สิ่งที่ควรเรียนรู้จากรอบนี้:

- การออกแบบ filter ที่ต่อยอดจากของเดิมโดยไม่รื้อทั้งหน้า
- ความต่างระหว่าง `search`, `status filter`, และ `date filter`
- การระวัง bug จาก timezone และขอบเขตวันเวลา

---

## Lesson Add-on: Admin Cross-View Reports

เป้าหมาย:

- ทำให้ admin เห็นภาพรวมจากหลายมุมมองในหน้าเดียว โดยไม่ต้องสลับไปมาระหว่าง inbox, activity, และ notifications

สิ่งที่ควรมี:

- summary cards จากข้อมูลจริง
- recent review decisions
- recent activity window
- export summary สำหรับนำไปใช้งานต่อ

สิ่งที่ควรเรียนรู้จากรอบนี้:

- เมื่อไรควรใช้ server-side aggregation แล้วส่งผลลัพธ์มาที่ UI ทีเดียว
- วิธี reuse data model เดิมให้เกิด reporting feature โดยไม่ต้องเพิ่ม table ใหม่ทันที
- ความต่างระหว่าง `operational inbox` กับ `management report`

