export function isMissingDatabaseObject(error: unknown, code: string, name: string): boolean {
  const failure = error as { code?: string; message?: string; cause?: unknown } | null;
  if (!failure || typeof failure !== "object") return false;
  if (failure.code === code && failure.message?.match(/\b\w+\b/g)?.includes(name)) return true;
  return failure.cause ? isMissingDatabaseObject(failure.cause, code, name) : false;
}
