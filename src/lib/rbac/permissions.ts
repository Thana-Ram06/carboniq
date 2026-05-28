import type { UserRole } from "@/types";

export type Permission =
  | "view:farms"
  | "create:farm"
  | "edit:farm"
  | "delete:farm"
  | "view:evidence"
  | "upload:evidence"
  | "validate:evidence"
  | "view:audit"
  | "create:audit"
  | "approve:audit"
  | "view:reports"
  | "generate:report"
  | "manage:org"
  | "manage:users"
  | "view:admin";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  farmer: [
    "view:farms", "create:farm", "edit:farm",
    "view:evidence", "upload:evidence",
    "view:audit",
    "view:reports", "generate:report",
  ],
  auditor: [
    "view:farms",
    "view:evidence", "validate:evidence",
    "view:audit", "create:audit", "approve:audit",
    "view:reports",
  ],
  org_manager: [
    "view:farms", "create:farm", "edit:farm",
    "view:evidence", "upload:evidence", "validate:evidence",
    "view:audit", "create:audit", "approve:audit",
    "view:reports", "generate:report",
    "manage:org",
  ],
  admin: [
    "view:farms", "create:farm", "edit:farm", "delete:farm",
    "view:evidence", "upload:evidence", "validate:evidence",
    "view:audit", "create:audit", "approve:audit",
    "view:reports", "generate:report",
    "manage:org", "manage:users", "view:admin",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    farmer: "Farmer",
    auditor: "Auditor",
    org_manager: "Org Manager",
    admin: "Admin",
  };
  return labels[role] ?? "User";
}

export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    farmer: "text-green-400",
    auditor: "text-blue-400",
    org_manager: "text-purple-400",
    admin: "text-orange-400",
  };
  return colors[role] ?? "text-muted-foreground";
}

export function getRoleBadgeVariant(role: UserRole): "green" | "blue" | "yellow" | "red" | "gray" {
  const variants: Record<UserRole, "green" | "blue" | "yellow" | "red" | "gray"> = {
    farmer: "green",
    auditor: "blue",
    org_manager: "yellow",
    admin: "red",
  };
  return variants[role] ?? "gray";
}
