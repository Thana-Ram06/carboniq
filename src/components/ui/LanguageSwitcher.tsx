"use client";

import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn("flex items-center gap-0.5 rounded-xl border border-border bg-card p-0.5", compact && "h-9")}>
      <button
        onClick={() => setLang("en")}
        className={cn(
          "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
          lang === "en"
            ? "bg-green-500/15 text-green-300 border border-green-500/20"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLang("hi")}
        className={cn(
          "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
          lang === "hi"
            ? "bg-green-500/15 text-green-300 border border-green-500/20"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        हिं
      </button>
    </div>
  );
}
