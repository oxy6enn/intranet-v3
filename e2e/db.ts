import "dotenv/config";
import { Client } from "pg";

export async function withDb<T>(
  work: (client: Client) => Promise<T>
): Promise<T> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

export async function promoteUserToSuperAdmin(email: string) {
  await withDb(async (client) => {
    await client.query(
      'UPDATE "user" SET role = $1, status = $2 WHERE email = $3',
      ["super_admin", "active", email]
    );
  });
}

export async function updateUserStatus(email: string, status: string) {
  await withDb(async (client) => {
    await client.query('UPDATE "user" SET status = $1 WHERE email = $2', [
      status,
      email,
    ]);
  });
}

export async function getUserIdByEmail(email: string) {
  return withDb(async (client) => {
    const result = await client.query<{ id: string }>(
      'SELECT id FROM "user" WHERE email = $1 LIMIT 1',
      [email]
    );

    return result.rows[0]?.id ?? null;
  });
}

export async function createPermissionForE2E({
  code,
  name,
  description,
}: {
  code: string;
  name: string;
  description: string;
}) {
  await withDb(async (client) => {
    await client.query(
      `
        INSERT INTO "Permission" (id, code, name, description, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          "updatedAt" = NOW()
      `,
      [`perm-${code}`, code, name, description]
    );
  });
}
