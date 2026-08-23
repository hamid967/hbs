export function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || "";
}

export function isConfiguredAdminEmail(email?: string | null) {
  const configuredEmail = normalizeEmail(process.env.HRHBS_ADMIN_EMAIL);
  return Boolean(configuredEmail && normalizeEmail(email) === configuredEmail);
}

export function getBootstrapAccountSettings(input: { openId: string; email?: string | null; ownerOpenId?: string }) {
  const isBootstrapAdmin = input.openId === input.ownerOpenId || isConfiguredAdminEmail(input.email);
  return { role: isBootstrapAdmin ? "admin" as const : "user" as const, accountStatus: isBootstrapAdmin ? "active" as const : "pending" as const };
}

export function createActivationHistoryRecord(input: { userId: number; actorId: number; previousStatus: "pending" | "active" | "suspended" | "rejected"; nextStatus: "pending" | "active" | "suspended" | "rejected"; assignedRole: "user" | "hr" | "government" | "manager" | "admin"; note?: string }) {
  return { userId: input.userId, actorId: input.actorId, previousStatus: input.previousStatus, nextStatus: input.nextStatus, assignedRole: input.assignedRole, note: input.note ?? null };
}
