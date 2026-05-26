import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 disabled:pointer-events-none disabled:opacity-40 select-none";

    const variants = {
      primary:
        "bg-green-500 hover:bg-green-400 text-black dark:bg-green-500 dark:hover:bg-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_30px_rgba(74,222,128,0.35)]",
      secondary:
        "bg-secondary/80 hover:bg-secondary text-secondary-foreground border border-border",
      ghost:
        "hover:bg-white/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground",
      outline:
        "border border-green-500/20 hover:border-green-500/40 bg-green-500/5 hover:bg-green-500/10 text-green-300 dark:text-green-400",
      destructive:
        "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40",
      link: "underline-offset-4 hover:underline text-green-400 p-0 h-auto",
    };

    const sizes = {
      sm: "h-8 rounded-lg px-3 text-sm",
      md: "h-10 rounded-xl px-5 text-sm",
      lg: "h-12 rounded-xl px-8 text-base",
      icon: "h-9 w-9 rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
