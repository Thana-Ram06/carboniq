"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { useAuth } from "@/hooks/use-auth";
import { RoleProvider } from "@/contexts/role-context";
import { VasudhaLogo } from "@/components/ui/vasudha-logo";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => { setMobileOpen(false); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <VasudhaLogo height={44} tagline={false} className="opacity-80 animate-pulse" />
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <RoleProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header onMenuClick={() => setMobileOpen((v) => !v)} />
          <OfflineIndicator />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 max-w-screen-2xl">{children}</div>
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}
