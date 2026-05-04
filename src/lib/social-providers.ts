export const SOCIAL_PROVIDERS = {
  GOOGLE: "google",
  LINE: "line",
  THAID: "thaid",
} as const;

export type SocialProviderId =
  (typeof SOCIAL_PROVIDERS)[keyof typeof SOCIAL_PROVIDERS];

export const SUPPORTED_SOCIAL_PROVIDERS = [
  SOCIAL_PROVIDERS.GOOGLE,
  SOCIAL_PROVIDERS.LINE,
] as const;
