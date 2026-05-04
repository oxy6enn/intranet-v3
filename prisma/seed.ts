import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashTemporaryPassword } from "../src/lib/temp-password";
import { USER_ROLE } from "../src/lib/user-role";
import { USER_STATUS } from "../src/lib/user-status";

const basePermissions = [
  {
    code: "employee:view",
    name: "View employee records",
    description: "ดูรายการข้อมูลพนักงานในระบบ",
  },
  {
    code: "employee:create",
    name: "Create employee records",
    description: "เพิ่มข้อมูลพนักงานใหม่",
  },
  {
    code: "employee:update",
    name: "Update employee records",
    description: "แก้ไขข้อมูลพนักงาน",
  },
  {
    code: "permission:manage",
    name: "Manage permissions",
    description: "จัดการ permission และสิทธิ์รายคน",
  },
];

async function seedPermissions() {
  for (const permission of basePermissions) {
    await prisma.permission.upsert({
      where: {
        code: permission.code,
      },
      update: {
        name: permission.name,
        description: permission.description,
      },
      create: permission,
    });
  }
}

async function seedSampleEmployee() {
  const employeeCode = "EMP001";
  const temporaryPassword = "TempPass123!";

  await prisma.employee.upsert({
    where: {
      employeeCode,
    },
    update: {
      fullName: "Sample Employee",
      position: "Developer",
      department: "Digital Service",
      tempPasswordHash: hashTemporaryPassword(temporaryPassword),
      tempPasswordExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
    create: {
      employeeCode,
      fullName: "Sample Employee",
      position: "Developer",
      department: "Digital Service",
      tempPasswordHash: hashTemporaryPassword(temporaryPassword),
      tempPasswordExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return { employeeCode, temporaryPassword };
}

async function promoteSeedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();

  if (!adminEmail) {
    return {
      promoted: false,
      reason: "SEED_ADMIN_EMAIL is empty",
    };
  }

  const adminUser = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!adminUser) {
    return {
      promoted: false,
      reason: `User ${adminEmail} not found yet`,
    };
  }

  await prisma.user.update({
    where: {
      id: adminUser.id,
    },
    data: {
      role: USER_ROLE.SUPER_ADMIN,
      status:
        adminUser.status === USER_STATUS.SUSPENDED
          ? USER_STATUS.SUSPENDED
          : USER_STATUS.ACTIVE,
    },
  });

  return {
    promoted: true,
    email: adminEmail,
  };
}

async function main() {
  await seedPermissions();
  const sampleEmployee = await seedSampleEmployee();
  const adminResult = await promoteSeedAdmin();

  console.log("Seed completed");
  console.log(
    JSON.stringify(
      {
        permissionsSeeded: basePermissions.map((item) => item.code),
        sampleEmployee,
        adminResult,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
