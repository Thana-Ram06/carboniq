"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Satellite,
  BarChart3,
  FileText,
  Settings,
  Leaf,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Farms",
    href: "/farms",
    icon: Map,
  },
  {
    label: "Satellite",
    href: "/satellite",
    icon: Satellite,
  },
  {
    label: "Carbon",
    href: "/carbon",
    icon: BarChart3,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

const BOTTOM_ITEMS = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "#", icon: HelpCircle },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen sidebar-surface transition-all duration-300 ease-in-out",
        collapsed ? "w-[64px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-border",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <Leaf className="w-4 h-4 text-green-400" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-foreground text-sm">
            Carbon<span className="text-green-400">IQ</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 h-9 rounded-xl px-2.5 transition-all duration-150 group",
                    active
                      ? "bg-green-500/12 text-green-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      active
                        ? "text-green-400"
                        : "text-muted-foreground/70 group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {active && !collapsed && (
                    <div className="ml-auto w-1 h-4 rounded-full bg-green-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 h-9 rounded-xl px-2.5 transition-all duration-150 group",
                    active
                      ? "bg-green-500/12 text-green-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User profile */}
      <div
        className={cn(
          "border-t border-border p-3",
          collapsed ? "flex justify-center" : ""
        )}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex-shrink-0 overflow-hidden">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName ?? "User"}
                  width={32}
                  height={32}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-green-400 font-semibold">
                  {user?.displayName?.[0]?.toUpperCase() ??
                    user?.email?.[0]?.toUpperCase() ??
                    "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.displayName ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut()}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-green-400 hover:border-green-500/30 transition-all z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
