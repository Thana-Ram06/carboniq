"use client";

import { useState } from "react";
import { Users, ChevronDown } from "lucide-react";
import type { UserRole } from "@/types";
import { getRoleLabel, getRoleColor } from "@/lib/rbac/permissions";

interface UserRow {
  uid: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  createdAt?: { seconds: number };
}

const ROLES: UserRole[] = ["farmer", "auditor", "org_manager", "admin"];

interface UserTableProps {
  users: UserRow[];
  onRoleChange?: (uid: string, role: UserRole) => Promise<void>;
}

export function UserTable({ users, onRoleChange }: UserTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleRoleChange(uid: string, role: UserRole) {
    if (!onRoleChange) return;
    setUpdating(uid);
    try {
      await onRoleChange(uid, role);
    } finally {
      setUpdating(null);
    }
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <Users className="w-8 h-8 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/50">No users found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="pb-2 text-left text-[11px] text-muted-foreground/50 font-medium">User</th>
            <th className="pb-2 text-left text-[11px] text-muted-foreground/50 font-medium">Email</th>
            <th className="pb-2 text-left text-[11px] text-muted-foreground/50 font-medium">Role</th>
            <th className="pb-2 text-left text-[11px] text-muted-foreground/50 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {users.map((user) => (
            <tr key={user.uid} className="group hover:bg-muted/30 transition-colors">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-green-400">
                      {(user.displayName?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                    {user.displayName ?? "—"}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="text-xs text-muted-foreground/70 truncate max-w-[160px] block">
                  {user.email ?? "—"}
                </span>
              </td>
              <td className="py-3 pr-4">
                <div className="relative inline-flex items-center gap-1">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                    disabled={updating === user.uid}
                    className={`appearance-none bg-transparent text-xs font-medium pr-5 cursor-pointer focus:outline-none disabled:opacity-50 ${getRoleColor(user.role)}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-background text-foreground">
                        {getRoleLabel(r)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-muted-foreground/40 absolute right-0 pointer-events-none" />
                </div>
              </td>
              <td className="py-3">
                <span className="text-[11px] text-muted-foreground/40">
                  {user.createdAt?.seconds
                    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString("en-IN")
                    : "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
