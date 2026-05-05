# Features Overview

ไฟล์นี้ใช้สรุปว่า “ตอนนี้ระบบทำอะไรได้แล้วบ้าง” แบบเน้นอ่านเร็ว และเหมาะกับการเช็กสถานะล่าสุดของ product

## Snapshot

- [x] Auth foundation
- [x] Employee identify flow
- [x] Role + direct permission system
- [x] Admin management พื้นฐาน
- [x] Permission request workflow
- [x] Dashboard real data
- [x] Notification center
- [x] Activity log
- [x] Search / filters ในหน้า operation หลัก
- [x] Export / reporting
- [x] Advanced date range filters
- [ ] ThaiD implementation

## Core Platform

- [x] Next.js App Router
- [x] TypeScript
- [x] Tailwind CSS
- [x] shadcn/ui
- [x] Better Auth
- [x] Prisma ORM + PostgreSQL

## Authentication And Identity

- [x] สมัครสมาชิกด้วย `email/password`
- [x] login ด้วย `email/password`
- [x] session-based authentication ผ่าน Better Auth
- [x] flow `pending_identify -> active -> suspended`
- [x] redirect ตามสถานะผู้ใช้ด้วย middleware

## Employee Identify Flow

- [x] หน้า `/identify`
- [x] verify ด้วย `employee_code + temporary_password`
- [x] claim employee record เข้ากับ user
- [x] update user status เป็น `active` หลัง verify สำเร็จ

## Authorization

- [x] role พื้นฐาน `user / admin / super_admin`
- [x] permission model แบบ direct assignment
- [x] helper `can()` และ route/api guards

## Admin Features

### Employees

- [x] ดูรายการพนักงาน
- [x] สร้างพนักงาน
- [x] แก้ไขข้อมูลพนักงาน

### Permissions

- [x] ดูรายการ permissions
- [x] สร้าง permission ใหม่

### User Permissions

- [x] ดูผู้ใช้ในระบบ
- [x] assign direct permission ให้ user รายคน

### Permission Request Inbox

- [x] review request แบบ approve / reject
- [x] approval rate
- [x] top requested permissions
- [x] latest review activity
- [x] most active requesters
- [x] search / status filters

## User Self-Service Features

- [x] หน้า `/dashboard` ใช้ข้อมูลจริงจากฐานข้อมูล
- [x] หน้า `/profile`
- [x] หน้า `/profile/security`
- [x] social linking scaffold สำหรับ Google / LINE
- [x] หน้า `/permissions/request` สำหรับขอสิทธิ์เพิ่ม
- [x] หน้า `/notifications`
- [x] หน้า `/activity`

## Activity And Visibility

- [x] Notification center
- [x] Activity log timeline
- [x] Activity export reporting
- [x] dashboard snapshot จากข้อมูลจริง
- [x] admin insights สำหรับ permission requests

## Search And Filters

### `/activity`

- [x] search keyword
- [x] filter `all / identify / request`
- [x] date range filter `all / 7d / 30d / 90d / custom`
- [x] export visible CSV
- [x] export summary CSV
- [x] date range filter `all / 7d / 30d / 90d / custom`
- [x] export visible CSV
- [x] export summary CSV

### `/notifications`

- [x] search keyword
- [x] filter `all / updates / queue / reviews`

### `/admin/permission-requests`

- [x] search keyword
- [x] filter `all / pending / approved / rejected`
- [x] date range filter `all / 7d / 30d / 90d / custom`
- [x] export visible CSV
- [x] export summary CSV

## UI / UX Foundation

- [x] responsive layout
- [x] dark / light mode
- [x] loading state
- [x] not-found page
- [x] shared workspace shell for user-side pages
- [x] Thai font base ด้วย `Anuphan`
- [x] English-friendly fallback ด้วย `Inter`

## Testing Confidence

- [x] logic tests
- [x] Playwright e2e coverage สำหรับ flow หลัก
- [x] auth flow
- [x] admin access control
- [x] employee / permission / assignment flows
- [x] permission request flow
- [x] admin reports route coverage

## Recommended Next Features

- [x] audit/reporting for admin-side reports and cross-view summaries
- [x] export / reporting สำหรับ permission request inbox
- [x] advanced filters เช่น date range
- [ ] audit/reporting เชิงลึก
- [ ] ThaiD prep / implementation
