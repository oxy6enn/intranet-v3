# Internal Auth Training Kit

ชุดไฟล์นี้ทำไว้สำหรับให้ Codex / AI Agent พาคุณฝึกเขียนระบบ Authentication สำหรับเว็บแอปภายในหน่วยงาน

แนวทางหลัก:

```text
Email/Password → Identify Employee → Active User → Link Social Provider
```

## Quick Start

1. ติดตั้ง dependencies

```bash
npm install
```

2. เตรียม environment

```bash
cp .env.example .env
```

3. รัน services ที่จำเป็น

```bash
docker compose up -d
```

4. รันแอป

```bash
npm run dev
```

5. ตรวจคุณภาพก่อนปิดงาน

```bash
npm run lint
npm run build
npm test
```

ถ้า feature กระทบ flow หลักของระบบ ให้รัน e2e เพิ่ม:

```bash
npm run test:e2e
```

## Current Status

ตอนนี้ระบบมี feature หลักพร้อมใช้งานแล้วในระดับ product foundation:

- auth + identify flow
- role + direct permissions
- admin employees / permissions / user permissions
- permission request workflow
- dashboard real data
- notification center
- activity log
- search / filters ในหน้า operation หลัก

ดูรายการ feature ล่าสุดแบบอ่านเร็วได้ที่:

- `docs/FEATURES.md`

## Docs Map

- `README.md` — ภาพรวมโปรเจกต์, สถานะล่าสุด, และภาพรวม feature
- `docs/ROADMAP.md` — roadmap และ implementation plan แบบ step-by-step
- `docs/PHASES.md` — สรุป phase และ post-phase expansion แบบอ่านเร็ว
- `docs/LESSONS.md` — บทเรียน, troubleshooting, และสิ่งที่เรียนรู้ระหว่างพัฒนา
- `docs/FEATURES.md` — สรุปว่า feature ไหนมีแล้วบ้างในระบบตอนนี้
- `docs/TESTING.md` — วิธีรัน test, coverage ปัจจุบัน, และ troubleshooting ด้านการทดสอบ
- `docs/DECISIONS.md` — architectural decisions และเหตุผลของทางเลือกสำคัญในโปรเจกต์

ต่อจากนี้ให้ใช้งานไฟล์ใน `docs/` เป็นแหล่งอ้างอิงหลักของโปรเจกต์

## ใช้กับ Codex อย่างไร

เปิดโปรเจกต์ใน VS Code แล้วให้ Codex อ่านไฟล์นี้ก่อน:

```text
docs/ROADMAP.md
```

จากนั้นให้ Codex ทำทีละ Phase ห้ามข้าม Phase

ถ้าต้องการดู:

- สิ่งที่ระบบทำได้แล้ว ให้เปิด `docs/FEATURES.md`
- สถานะ phase ปัจจุบัน ให้เปิด `docs/PHASES.md`
- วิธีทดสอบและ coverage ให้เปิด `docs/TESTING.md`
- เหตุผลของแนวทางที่เลือก ให้เปิด `docs/DECISIONS.md`

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

## Detailed References

README ตั้งใจให้เป็นหน้าเริ่มต้นที่อ่านเร็ว ดังนั้นรายละเอียดเชิงลึกถูกแยกไว้ดังนี้:

- `docs/FEATURES.md`
  - รายการ feature ที่มีแล้ว
  - dashboard / notifications / activity / permission request overview
- `docs/TESTING.md`
  - e2e coverage ปัจจุบัน
  - troubleshooting การรัน test
  - แนวทางตรวจงานก่อน commit
- `docs/DECISIONS.md`
  - เหตุผลของ auth flow
  - Prisma 7 / Better Auth / docs strategy
  - e2e strategy บน Windows
- `docs/LESSONS.md`
  - บันทึกการเรียนรู้
  - troubleshooting เชิงประสบการณ์
- `docs/ROADMAP.md`
  - phase ถัดไป
  - implementation direction แบบ step-by-step

