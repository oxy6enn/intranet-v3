# Testing Guide

ไฟล์นี้ใช้สรุปว่าโปรเจกต์นี้ทดสอบอะไรอย่างไร และควรรันคำสั่งไหนในสถานการณ์ใด

## Test Layers

โปรเจกต์นี้มี test หลัก 3 ชั้น:

1. `lint`
2. `build`
3. automated tests

โดย automated tests แยกเป็น:

- lightweight logic tests
- Playwright end-to-end tests

## Commands

### Lint

```bash
npm run lint
```

ใช้เช็ก:

- ESLint rules
- import issues
- code quality regressions เบื้องต้น

### Build

```bash
npm run build
```

ใช้เช็ก:

- production build ผ่าน
- TypeScript สำหรับแอปหลัก
- route generation และ server/client boundary เบื้องต้น

### Logic Tests

```bash
npm test
```

ใช้เช็ก test ชุดเล็กที่ไม่พึ่ง browser เช่น:

- permission checks
- route access helpers
- access policy
- temp password hashing / verify
- admin role checks

## E2E Tests

### Headless

```bash
npm run test:e2e
```

### Headed

```bash
npm run test:e2e:headed
```

เหมาะกับ:

- ดู flow จริงใน browser
- debug selector หรือ redirect
- ตรวจว่าการ redesign UI ไม่ทำให้ business flow พัง

## Current E2E Coverage

ตอนนี้มี Playwright flows หลักอย่างน้อย:

- `auth-flow.spec.ts`
  - register -> identify -> dashboard -> logout -> login
- `admin-access.spec.ts`
  - active non-admin เข้า admin ไม่ได้
- `admin-employees.spec.ts`
  - admin create employee
- `admin-permissions.spec.ts`
  - admin create permission
- `admin-user-permissions.spec.ts`
  - admin assign direct permission
- `pending-access.spec.ts`
  - pending user เข้า dashboard ไม่ได้
- `suspended-access.spec.ts`
  - suspended user ถูกพาไป `/suspended`
- `permission-request-flow.spec.ts`
  - permission request workflow หลัก

## Windows Notes

บน Windows เราใช้แนวทางนี้เพื่อให้ e2e เสถียรขึ้น:

- build ก่อนอัตโนมัติผ่าน `pretest:e2e`
- ใช้ production server สำหรับ Playwright
- รัน `1 worker`
- ใช้ `localhost` ให้ตรงกับ auth/cookie origin

## Common Troubleshooting

### Port 3000 is already in use

อาการ:

- Playwright start server ไม่ได้
- เจอ `EADDRINUSE`

แนวทาง:

- ปิด process ที่ค้างอยู่บน port `3000`
- แล้วรัน `npm run test:e2e` ใหม่

### Native form submit instead of React submit

อาการ:

- URL กลายเป็น `/register?...`
- test ไม่ redirect ตามที่ควร

แนวทาง:

- เช็กว่า form action ยังใช้ flow แบบ React จริง
- เช็ก selector/test id ของปุ่ม submit
- ใช้ e2e เป็นตัวจับ regression หลังแก้ UI

### Browser launch / environment-specific errors

บาง environment อาจมีปัญหาเช่น:

- browser spawn ไม่ผ่าน
- `AggregateError` ตอน Playwright launch
- sandbox / permission issue

แนวทาง:

- ลองรันบนเครื่อง local โดยตรง
- ใช้ `npm run test:e2e:headed` เพื่อดูพฤติกรรมจริง
- ถ้า `lint`, `build`, และ `npm test` ผ่าน แต่ Playwright ล้มตั้งแต่ launch ให้แยกสาเหตุว่าเป็น environment หรือ application behavior

## Recommended Verification Order

เวลาปิดงานแต่ละ feature แนะนำให้เช็กตามลำดับนี้:

1. `npm run lint`
2. `npm run build`
3. `npm test`
4. `npm run test:e2e` หรือ `npm run test:e2e:headed` ถ้า feature กระทบ flow หลัก

## When To Update This File

อัปเดต `docs/TESTING.md` เมื่อ:

- เพิ่ม test suite ใหม่
- เปลี่ยนคำสั่ง test
- เปลี่ยนแนวทางรัน e2e
- เจอ troubleshooting สำคัญที่ควรบันทึกไว้ให้รอบถัดไป
