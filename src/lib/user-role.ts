export const USER_ROLE = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export function isAdminRole(role: string) {
  return role === USER_ROLE.SUPER_ADMIN || role === USER_ROLE.ADMIN;
}
