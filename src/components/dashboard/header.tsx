"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Bell, Search, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/farms": "Farms",
  "/satellite": "Satellite Analytics",
  "/carbon": "Carbon Estimation",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathParts = pathname.split("/").filter(Boolean);
  const currentPage = BREADCRUMBS[`/${pathParts[0]}`] ?? pathParts[0];

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">CarbonIQ</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        <span className="text-foreground font-medium">{currentPage}</span>
        {pathParts.length > 1 && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-muted-foreground">{pathParts[1]}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card text-muted-foreground text-sm hover:border-green-500/20 hover:text-foreground transition-all">
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-1 text-xs border border-border rounded px-1.5 py-0.5 text-muted-foreground/70">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-green-500/20 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400" />
        </button>

        {/* Theme toggle — only render after mount to avoid hydration mismatch */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-green-500/20 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        )}

        {/* User avatar */}
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-border bg-green-500/10 flex items-center justify-center cursor-pointer hover:border-green-500/30 transition-all">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName ?? "User"}
              width={36}
              height={36}
            />
          ) : (
            <span className="text-sm font-semibold text-green-400">
              {user?.displayName?.[0]?.toUpperCase() ??
                user?.email?.[0]?.toUpperCase() ??
                "U"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
