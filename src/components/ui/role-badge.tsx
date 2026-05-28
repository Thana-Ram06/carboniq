import { Badge } from "@/components/ui/badge";
import { getRoleLabel, getRoleBadgeVariant } from "@/lib/rbac/permissions";
import type { UserRole } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md";
}

export function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  return (
    <Badge variant={getRoleBadgeVariant(role)} size={size}>
      {getRoleLabel(role)}
    </Badge>
  );
}
