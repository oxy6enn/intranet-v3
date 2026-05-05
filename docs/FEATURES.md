# Features Overview

ไฟล์นี้ใช้สรุปว่า “ตอนนี้ระบบทำอะไรได้แล้วบ้าง” แบบเน้นอ่านเร็ว

## Core Platform

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Better Auth
- Prisma ORM + PostgreSQL

## Authentication And Identity

- สมัครสมาชิกด้วย `email/password`
- login ด้วย `email/password`
- session-based authentication ผ่าน Better Auth
- flow `pending_identify -> active -> suspended`
- redirect ตามสถานะผู้ใช้ด้วย middleware

## Employee Identify Flow

- หน้า `/identify`
- verify ด้วย `employee_code + temporary_password`
- claim employee record เข้ากับ user
- update user status เป็น `active` หลัง verify สำเร็จ

## Authorization

- role พื้นฐาน:
  - `user`
  - `admin`
  - `super_admin`
- permission model แบบ direct assignment
- helper `can()` และ route/api guards สำหรับเช็กสิทธิ์

## Admin Features

### Employees

- ดูรายการพนักงาน
- สร้างพนักงาน
- แก้ไขข้อมูลพนักงาน

### Permissions

- ดูรายการ permissions
- สร้าง permission ใหม่

### User Permissions

- ดูผู้ใช้ในระบบ
- assign direct permission ให้ user รายคน

### Permission Request Inbox

- review request แบบ approve / reject
- approval rate
- top requested permissions
- latest review activity
- most active requesters
- search / status filters

## User Self-Service Features

- หน้า `/dashboard` ใช้ข้อมูลจริงจากฐานข้อมูล
- หน้า `/profile`
- หน้า `/profile/security`
- social linking scaffold สำหรับ Google / LINE
- หน้า `/permissions/request` สำหรับขอสิทธิ์เพิ่ม
- หน้า `/notifications`
- หน้า `/activity`

## Activity And Visibility

- Notification center
- Activity log timeline
- dashboard snapshot จากข้อมูลจริง
- admin insights สำหรับ permission requests

## Search And Filters

- `/activity`
  - search keyword
  - filter `all / identify / request`
- `/notifications`
  - search keyword
  - filter `all / updates / queue / reviews`
- `/admin/permission-requests`
  - search keyword
  - filter `all / pending / approved / rejected`

## UI / UX Foundation

- responsive layout
- dark / light mode
- loading state
- not-found page
- Thai font base ด้วย `Anuphan`
- English-friendly fallback ด้วย `Inter`

## Current Status Summary

ถ้ามองแบบ product level ตอนนี้ระบบมีครบแล้วในระดับนี้:

- auth + identify
- admin CRUD พื้นฐานที่จำเป็น
- permission request workflow
- dashboard real data
- notifications + activity
- search/filter ในหน้า operation หลัก

ถัดจากนี้เหมาะกับการต่อยอดเช่น:

- reporting / export
- advanced filters เช่น date range
- audit/reporting เชิงลึก
- ThaiD prep ในอนาคต
