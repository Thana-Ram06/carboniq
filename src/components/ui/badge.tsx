import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "green"
    | "yellow"
    | "red"
    | "blue"
    | "purple"
    | "gray"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-green-500/10 text-green-400 border border-green-500/20",
    green:
      "bg-green-500/10 text-green-400 border border-green-500/20",
    yellow:
      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    red: "bg-red-500/10 text-red-400 border border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    purple:
      "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    gray: "bg-white/5 text-zinc-400 border border-white/10",
    outline: "bg-transparent text-muted-foreground border border-border",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs rounded-md",
    md: "px-2.5 py-1 text-xs rounded-lg",
  };

  const dotColors = {
    default: "bg-green-400",
    green: "bg-green-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400",
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    gray: "bg-zinc-400",
    outline: "bg-zinc-400",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColors[variant]
          )}
        />
      )}
      {children}
    </div>
  );
}
