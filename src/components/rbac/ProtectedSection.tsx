"use client";

import { useRole } from "@/hooks/use-role";
import { hasPermission, type Permission } from "@/lib/rbac/permissions";

interface ProtectedSectionProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function ProtectedSection({ permission, fallback = null, children }: ProtectedSectionProps) {
  const { role, loading } = useRole();
  if (loading) return null;
  if (!hasPermission(role, permission)) return <>{fallback}</>;
  return <>{children}</>;
}
