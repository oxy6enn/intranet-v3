export const USER_STATUS = {
  PENDING_IDENTIFY: "pending_identify",
  ACTIVE: "active",
  SUSPENDED: "suspended",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
