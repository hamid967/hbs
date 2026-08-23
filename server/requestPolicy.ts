export type UserRole = "user" | "hr" | "government" | "manager" | "admin";
export type RequestType = "hr" | "government";

export function canManageRequest(role: UserRole, type: RequestType) {
  return role === "admin" || role === "manager" || (role === "hr" && type === "hr") || (role === "government" && type === "government");
}

export function permittedRequestTypes(role: UserRole): RequestType[] {
  if (role === "admin" || role === "manager") return ["hr", "government"];
  if (role === "hr") return ["hr"];
  if (role === "government") return ["government"];
  return [];
}

export function createRequestReference(type: RequestType, timestamp = Date.now()) {
  const prefix = type === "hr" ? "HR" : "GR";
  const sequence = String(timestamp).slice(-6);
  const randomPart = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `HBS-${prefix}-${sequence}-${randomPart}`;
}
