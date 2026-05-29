"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Search, ChevronRight, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import Image from "next/image";

const BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/farms": "Farms",
  "/satellite": "Satellite Analytics",
  "/carbon": "Carbon Estimation",
  "/evidence": "Field Evidence",
  "/audit": "Audit & Verification",
  "/reports": "MRV Reports",
  "/settings": "Settings",
  "/pilot": "Pilot Management",
  "/admin": "Admin Superpanel",
  "/intelligence": "AI Intelligence",
  "/regional": "Regional Analytics",
  "/integrations": "External Integrations",
  "/pipelines": "Data Pipelines",
  "/api-portal": "API Portal",
  "/methodology": "Scientific Methodology",
  "/organization": "Organization",
  "/status":       "Infrastructure Status",
  "/security":     "Security & Compliance",
  "/cost":         "Cost Optimization",
  "/analytics":    "Production Analytics",
  "/devops":       "DevOps & Operations",
  "/gov":          "Government Dashboard",
  "/onboarding":   "Partner Onboarding",
  "/deployment":   "Deployment Workflows",
  "/compliance":   "Compliance Reporting",
  "/interop":      "Interoperability",
  "/field-ops":    "Field Operations",
  "/ecosystem":    "Ecosystem Analytics",
  "/validation":   "Scientific Validation",
  "/calibration":  "Calibration Engine",
  "/pilot-ops":    "Pilot Operations",
  "/benchmarks":   "Scientific Benchmarks",
  "/research":     "Research Datasets",
  "/ops-health":   "Operational Health",
  "/command":      "National Command Center",
  "/trust":        "Trust & Verification Registry",
  "/transparency": "Public Transparency",
  "/oversight":    "Scientific Oversight",
  "/governance":   "Governance & Compliance",
  "/reliability":  "Data Reliability Engine",
  "/institutional":"Institutional Partner Network",
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const pathParts = pathname.split("/").filter(Boolean);
  const currentPage = BREADCRUMBS[`/${pathParts[0]}`] ?? pathParts[0];

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0 gap-3">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all flex-shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-muted-foreground hidden sm:block truncate">VasudhaCarbon</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 hidden sm:block flex-shrink-0" />
          <span className="text-foreground font-medium truncate">{currentPage}</span>
          {pathParts.length > 1 && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              <span className="text-muted-foreground truncate">{pathParts[1]}</span>
            </>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Search — desktop only */}
        <button className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-card text-muted-foreground text-sm hover:border-green-500/20 hover:text-foreground transition-all">
          <Search className="w-3.5 h-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="ml-1 text-xs border border-border rounded px-1.5 py-0.5 text-muted-foreground/60 font-mono">⌘K</kbd>
        </button>

        {/* Language switcher — desktop only */}
        <div className="hidden lg:flex">
          <LanguageSwitcher compact />
        </div>

        {/* Live notification bell */}
        <NotificationBell />

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-green-500/20 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* User avatar */}
        <div className="w-9 h-9 rounded-xl overflow-hidden border border-border bg-green-500/10 flex items-center justify-center cursor-pointer hover:border-green-500/30 transition-all flex-shrink-0">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt={user.displayName ?? "User"} width={36} height={36} />
          ) : (
            <span className="text-sm font-semibold text-green-400">
              {user?.displayName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
