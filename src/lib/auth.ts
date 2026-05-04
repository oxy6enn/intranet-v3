import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

const socialProviders: Record<
  string,
  {
    clientId: string;
    clientSecret: string;
  }
> = {};

const isE2ETest = process.env.E2E_TEST === "1";

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

if (process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_SECRET) {
  socialProviders.line = {
    clientId: process.env.LINE_CLIENT_ID,
    clientSecret: process.env.LINE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  appName: "Internal Auth Training Kit",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "pending_identify",
        input: false,
      },
    },
  },
  socialProviders,
  rateLimit: {
    enabled: !isE2ETest,
  },
  plugins: [nextCookies()],
});
