"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import NextImage from "next/image";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Farms", href: "/farms", icon: Map },
  { label: "Satellite", href: "/satellite", icon: Satellite },
  { label: "Carbon", href: "/carbon", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
];

const BOTTOM_ITEMS = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "#", icon: HelpCircle },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const NavLink = ({
    href,
    icon: Icon,
    label,
    active,
  }: {
    href: string;
    icon: typeof LayoutDashboard;
    label: string;
    active: boolean;
  }) => (
    <Link href={href} onClick={onClose}>
      <div
        className={cn(
          "flex items-center gap-3 h-9 rounded-xl px-2.5 transition-all duration-150 group cursor-pointer",
          active
            ? "bg-green-500/12 text-green-300"
            : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]",
          collapsed && !mobileOpen && "justify-center px-2"
        )}
        title={collapsed && !mobileOpen ? label : undefined}
      >
        <Icon
          className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors",
            active
              ? "text-green-400"
              : "text-muted-foreground/60 group-hover:text-foreground"
          )}
        />
        {(!collapsed || mobileOpen) && (
          <span className="text-sm font-medium">{label}</span>
        )}
        {active && (!collapsed || mobileOpen) && (
          <div className="ml-auto w-1 h-4 rounded-full bg-green-400/70" />
        )}
      </div>
    </Link>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-16 px-3 border-b border-border flex-shrink-0",
          collapsed && !mobileOpen ? "justify-center" : "justify-between"
        )}
      >
        {collapsed && !mobileOpen ? (
          <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-green-400" />
          </div>
        ) : (
          <div className="dark:bg-white dark:rounded-md dark:px-1.5 dark:py-0.5 flex-shrink-0">
            <NextImage
              src="/images/vasudha-logo.png"
              alt="VASUDHA"
              width={120}
              height={40}
              className="object-contain h-7 w-auto"
              priority
            />
          </div>
        )}
        {/* Mobile close button */}
        {mobileOpen && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={active}
              />
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex flex-col gap-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={active}
              />
            );
          })}
        </div>
      </nav>

      {/* User profile */}
      <div
        className={cn(
          "border-t border-border p-3 flex-shrink-0",
          collapsed && !mobileOpen ? "flex justify-center" : ""
        )}
      >
        {!collapsed || mobileOpen ? (
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
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "relative hidden md:flex flex-col h-screen sidebar-surface transition-all duration-300 ease-in-out flex-shrink-0",
          collapsed ? "w-[64px]" : "w-[220px]"
        )}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-green-400 hover:border-green-500/30 transition-all z-10 shadow-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex flex-col h-full w-[260px] sidebar-surface shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
