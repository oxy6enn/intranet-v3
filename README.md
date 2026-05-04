# Internal Auth Training Kit

ชุดไฟล์นี้ทำไว้สำหรับให้ Codex / AI Agent พาคุณฝึกเขียนระบบ Authentication สำหรับเว็บแอปภายในหน่วยงาน

แนวทางหลัก:

```text
Email/Password → Identify Employee → Active User → Link Social Provider
```

## ไฟล์สำคัญ

- `CODEX_STEP_BY_STEP.md` — prompt แบบ step-by-step สำหรับสั่ง Codex
- `HANDS_ON_LESSONS.md` — แผนจับมือทำทีละบท

## แนวคิดระบบ

- สมัครสมาชิกด้วย email/password ก่อนเท่านั้น
- สมัครแล้วสถานะผู้ใช้เป็น `pending_identify`
- ผู้ใช้ต้องกรอก `employee_code` + `temporary_password`
- ข้อมูลพนักงาน เช่น ชื่อ ตำแหน่ง แผนก ต้องมาจาก admin เท่านั้น
- หลัง identify ผ่านแล้วจึงเป็น `active`
- หลังเป็น `active` เท่านั้นจึงค่อยผูก Google / LINE / ThaiD ได้

## หมายเหตุเรื่อง Prisma รุ่นใหม่

- ถ้าใช้ Prisma 7+ อย่าใส่ `datasource.url` ไว้ใน `schema.prisma`
- ให้ย้าย URL ของฐานข้อมูลไปไว้ใน `prisma.config.ts` แทน
- ควรกำหนด `generator client` ให้มี `output` ชัดเจน
- ตอนใช้งาน runtime กับ PostgreSQL ให้ใช้ `@prisma/adapter-pg` ร่วมกับ `PrismaClient`

ตัวอย่าง `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

ตัวอย่าง `prisma.config.ts`:

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

ตัวอย่าง `src/lib/prisma.ts`:

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

## หมายเหตุเรื่อง Better Auth

- Better Auth ใช้ core tables หลักอย่าง `User`, `Session`, `Account`, `Verification`
- ถ้าเปิด email/password รหัสผ่านจะไม่เก็บใน `User` แต่เก็บใน `Account.password`
- ถ้าต้องการ field เพิ่มใน user เช่น `role` และ `status` ให้ใส่ผ่าน `user.additionalFields`
- สำหรับ Next.js App Router ควรมีไฟล์ `src/lib/auth.ts`, `src/lib/auth-client.ts` และ route `src/app/api/auth/[...all]/route.ts`
- ควรตั้งค่า `BETTER_AUTH_URL` และ `BETTER_AUTH_SECRET` ใน `.env`

## หมายเหตุเรื่อง Identify Flow

- หน้า `/identify` ต้องตรวจ session ก่อน และควร redirect ถ้า user ยังไม่ login
- การดึง session ฝั่ง server ใช้ `auth.api.getSession({ headers: await headers() })`
- route `/api/identify` ควรตรวจ `user.status === "pending_identify"` ก่อนเสมอ
- temporary password ต้องตรวจจาก hash เช่น helper แยกใน `src/lib/temp-password.ts`
- เมื่อ verify สำเร็จ ให้ update ทั้ง `Employee.isClaimed/claimedUserId` และ `User.status = "active"` ภายใน transaction เดียวกัน

## หมายเหตุเรื่อง Middleware และ Admin

- ใน Next.js 16 สามารถใช้ `middleware.ts` แบบ `runtime: "nodejs"` แล้วเรียก `auth.api.getSession()` ได้
- middleware ควรบังคับ flow หลักดังนี้: guest ไป `/login`, `pending_identify` ไป `/identify`, `active` ออกจาก `/identify`, `suspended` ไป `/suspended`
- เส้นทาง `/admin/*` ควรเปิดเฉพาะ `admin` และ `super_admin`
- Phase 7 ควรมีหน้าอย่างน้อย:
  - `/admin/employees`
  - `/admin/employees/create`
  - `/admin/employees/[id]/edit`

## หมายเหตุเรื่อง Social Linking

- social provider ต้องเป็นวิธีเข้าสู่ระบบเสริมหลัง user `active` แล้วเท่านั้น
- หน้า `/profile/security` ควรเช็ก linked accounts จากตาราง `Account`
- ฝั่ง client ใช้ `authClient.linkSocial({ provider, callbackURL })`
- provider อย่าง Google / LINE ควรเปิดใช้แบบ conditional ตาม env
- ThaiD ในรอบนี้ยังเป็น placeholder เพื่อเตรียมไปสู่ Generic OAuth / OIDC ภายหลัง

## ใช้กับ Codex อย่างไร

เปิดโปรเจกต์ใน VS Code แล้วให้ Codex อ่านไฟล์นี้ก่อน:

```text
CODEX_STEP_BY_STEP.md
```

จากนั้นให้ Codex ทำทีละ Phase ห้ามข้าม Phase

## Flow Update: Register / Login / Identify

- หน้า `/register` และ `/login` ควรเช็ก session ฝั่ง server ด้วย `auth.api.getSession({ headers: await headers() })`
- ถ้า user ยังอยู่สถานะ `pending_identify` แล้วเผลอกดย้อนกลับมาหน้า auth ให้ redirect กลับ `/identify` อัตโนมัติ
- ถ้า user เป็น `active` ให้ redirect ไป `/dashboard`
- ถ้า user เป็น `suspended` ให้ redirect ไป `/suspended`
- หน้า `/identify` ควรแสดงอีเมลของบัญชีใน session ปัจจุบันด้วย เพื่อให้ผู้ใช้รู้ชัดว่ากำลัง identify ของใครอยู่

## E2E Troubleshooting

- คำสั่ง `npm run test:e2e:headed` คือการรัน Playwright แบบเปิดหน้าต่าง browser เพื่อดู flow จริงระหว่าง test
- ถ้า error ว่า `spawn EPERM` หรือเปิด browser ไม่ได้ใน sandbox ของ Codex ไม่ได้แปลว่า test พังเสมอไป แต่เป็นข้อจำกัดของ environment ที่ไม่ยอม spawn browser process ให้ไปลองรันบนเครื่อง local แทน
- ถ้า test ค้างที่หน้า `/register` หรือ `/login` ทั้งที่กด submit แล้ว ให้เช็ก `playwright.config.ts` ว่า `baseURL` และ `webServer.url` ใช้ host เดียวกับ `BETTER_AUTH_URL` ใน `.env`
- ในโปรเจกต์นี้ควรใช้ `http://localhost:3000` ให้ตรงกัน เพราะถ้า Playwright ใช้ `127.0.0.1` แต่ Better Auth ใช้ `localhost` cookie และ origin อาจไม่ตรงกันจน register หรือ login ไม่สำเร็จ
- ถ้าเจออาการ browser พาไป `GET /register?...` หรือ `GET /login?...` แปลว่ามี native form submit เกิดก่อน React handle event ฝั่ง client
- วิธีแก้ที่ใช้ในโปรเจกต์นี้คือให้ปุ่มส่งฟอร์มเป็น `type="button"` แล้วเรียก `form.handleSubmit(onSubmit)()` ผ่าน `onClick` แทนการพึ่ง native submit โดยตรง
- ถ้า test บางรอบไม่เสถียร ให้ใช้ `data-testid` กับปุ่มหลัก และให้ Playwright รอ page settle ก่อนคลิก เช่น `waitForLoadState("domcontentloaded")`
- ถ้า register หรือ identify ไม่ผ่านเพราะข้อมูลทดสอบค้างอยู่ ให้เช็ก `e2e/global-setup.ts` ว่า reset user ทดสอบและคืนค่า sample employee แล้วหรือยัง
- ถ้าต้องการดูว่าติดตรงไหนจริง ให้ใช้ `npm run test:e2e:headed` เพื่อเห็น browser เดินทีละขั้น และเปิด screenshot/video ในโฟลเดอร์ `test-results/` ประกอบ

## E2E Coverage

- ตอนนี้โปรเจกต์มี Playwright e2e ครอบคลุม 7 flows สำคัญแล้ว
- `auth-flow.spec.ts` ทดสอบ `register -> identify -> dashboard -> logout -> login`
- `admin-employees.spec.ts` ทดสอบ admin สร้าง employee record
- `admin-permissions.spec.ts` ทดสอบ admin สร้าง permission record
- `admin-user-permissions.spec.ts` ทดสอบ admin assign direct permission ให้ user
- `admin-access.spec.ts` ทดสอบว่า active user ที่ไม่ใช่ admin ถูก redirect ออกจาก `/admin/*`
- `pending-access.spec.ts` ทดสอบว่า user ที่ยัง `pending_identify` ถูก redirect ออกจาก `/dashboard` กลับ `/identify`
- `suspended-access.spec.ts` ทดสอบว่า user ที่ถูกตั้งสถานะ `suspended` ถูก redirect ไป `/suspended`
- ชุด test ตอนนี้จึงครอบทั้ง happy paths และ access-control paths หลักของระบบแล้ว
- บน Windows เราใช้ production server สำหรับ e2e แทน `next dev` เพื่อลดปัญหา `.next/dev` และ Turbopack ระหว่างรัน browser test
- config ปัจจุบันจึง build ก่อนอัตโนมัติ, เปิด `next start -p 3000`, และรัน `1 worker` เพื่อให้ suite เสถียรขึ้น

## UI Redesign Notes

- ตอนนี้หน้า `/`, `/register`, `/login`, `/identify`, `/dashboard`, `/profile`, `/profile/security`, `/suspended` และหน้า admin หลัก ถูกปรับไปทาง visual style แบบ `default shadcn/ui` + `shadcnblocks` reference แล้ว
- landing page ใช้แนวทางโปร่ง, spacing เยอะ, hero ใหญ่, grid background และ section chips
- auth pages ใช้ centered layout ที่เรียบขึ้น เพื่อให้ form เป็นจุดโฟกัสหลัก
- dashboard ใช้ app-shell pattern ที่มี sidebar, topbar, search, metric cards และ quick actions
- admin pages ใช้โครงแบบ data product มากขึ้น เช่น card shell, clean tables, muted headers และฟอร์มที่เรียบสม่ำเสมอ
- การ redesign รอบนี้ยังคง `id` และ `data-testid` สำคัญไว้ เพื่อไม่ให้ e2e suite แตกโดยไม่จำเป็น

## Thai Font And Encoding Notes

- ฟอนต์หลักของระบบถูกจัดให้ใช้ `Anuphan` เป็นตัวตั้งต้นก่อน `Inter`
- toast notifications ก็ถูกบังคับให้ใช้ฟอนต์ไทยตามระบบหลักแล้ว
- ถ้าเห็นตัวอักษรลักษณะ `เธ...` ปัญหามักไม่ได้มาจากฟอนต์ แต่เกิดจาก source text ในไฟล์เพี้ยนตั้งแต่ encoding
- ในรอบล่าสุดเราไล่ซ่อมข้อความเพี้ยนใน `src/` แล้ว และเช็กซ้ำว่าไม่เหลือข้อความ `เธ...` ใน source ฝั่งแอป
- หลังแก้ข้อความไทยและปรับ UI ใหม่ ชุด Playwright e2e ทั้ง 7 flows ยังผ่านครบอยู่

## Git Workflow Notes

- หลังจากทำ feature เสร็จเป็นช่วง ๆ ให้ commit แยกตาม feature แทนการรวมหลายเรื่องไว้ใน commit เดียว
- ให้พยายามทำให้แต่ละ feature complete ในระดับนี้ก่อน commit:
  - code ของ feature ใช้งานได้
  - `npm run lint` ผ่าน
  - `npm run build` ผ่าน
  - ถ้า feature กระทบ flow สำคัญ ให้รัน e2e ที่เกี่ยวข้องด้วย
- repository ปลายทางของโปรเจกต์นี้คือ:
  - `https://github.com/oxy6enn/intranet-v3.git`
- แนวทาง commit message ที่ควรใช้:
  - `feat: add permission request workflow`
  - `fix: resolve thai text encoding in auth pages`
  - `test: cover admin access redirects`
  - `docs: update redesign and e2e notes`

