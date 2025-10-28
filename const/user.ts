const USER_TYPE = {
  "1": "Admin",
  "2": "Customer",
} as const;

export function getUserType(code: string): string | undefined {
  return USER_TYPE[code as keyof typeof USER_TYPE];
}
