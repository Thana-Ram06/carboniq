"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, RefreshCw, AlertOctagon } from "lucide-react";
import { useRole } from "@/hooks/use-role";
import { AdminStats } from "@/components/admin/AdminStats";
import { PlatformHealth } from "@/components/admin/PlatformHealth";
import { UserTable } from "@/components/admin/UserTable";
import { ScanQueueMonitor } from "@/components/admin/ScanQueueMonitor";
import { CostDashboard } from "@/components/admin/CostDashboard";
import { AdminActivityLog } from "@/components/admin/AdminActivityLog";
import type { AdminPlatformStats, UserRole } from "@/types";

interface UserRow {
  uid: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  createdAt?: { seconds: number };
}

export default function AdminPage() {
  const { role, loading: roleLoading } = useRole();
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      // Silently fail
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch {
      // Silently fail
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  async function handleRefresh() {
    await Promise.all([fetchStats(), fetchUsers()]);
    setLastRefresh(new Date());
  }

  async function handleRoleChange(uid: string, newRole: UserRole) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, role: newRole }),
    });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: newRole } : u));
  }

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="w-6 h-6 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin" />
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertOctagon className="w-7 h-7 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Admin Access Required</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            This section is restricted to platform administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Superpanel</h1>
            <p className="text-xs text-muted-foreground/60">
              Platform-wide monitoring & control · Last refreshed {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 h-9 px-4 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-green-500/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Platform Stats */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
          Platform Metrics
        </h2>
        <AdminStats stats={stats} loading={statsLoading} />
      </section>

      {/* Health + Cost row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlatformHealth />
        <CostDashboard />
      </div>

      {/* Scan Queue + Activity Log row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScanQueueMonitor />
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-foreground">Admin Activity Log</h3>
          </div>
          <AdminActivityLog activities={[]} loading={false} />
        </div>
      </div>

      {/* User Management */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
            User Management
          </h2>
          <span className="text-xs text-muted-foreground/40">{users.length} users</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          {usersLoading ? (
            <div className="space-y-2">
              {[0,1,2,3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <UserTable users={users} onRoleChange={handleRoleChange} />
          )}
        </div>
      </section>
    </div>
  );
}
