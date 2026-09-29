const ADMIN_EMAILS = new Set([
  "bishnoi11011@gmail.com",
  "vatskritika07@gmail.com",
  "vaishnavidhamija95@gmail.com",
]);

export function isAdminEmail(email: unknown): boolean {
  return typeof email === "string" && ADMIN_EMAILS.has(email.trim().toLowerCase());
}
