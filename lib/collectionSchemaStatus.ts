// Public pages remain usable while the new schema awaits application.
export function isCollectionSchemaMissing(error: unknown): boolean {
  const failure = error as { code?: string; message?: string; cause?: unknown } | null;
  if (!failure || typeof failure !== "object") return false;
  if (failure.code === "42P01" && /\b(collections|collection_products)\b/.test(failure.message ?? "")) return true;
  return failure.cause ? isCollectionSchemaMissing(failure.cause) : false;
}
