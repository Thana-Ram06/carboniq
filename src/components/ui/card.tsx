import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glow" | "flat";
  hover?: boolean;
}

export function Card({
  className,
  variant = "default",
  hover = false,
  ...props
}: CardProps) {
  const variants = {
    default:
      "bg-card border border-border rounded-2xl",
    glass:
      "bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl",
    glow: "bg-card border border-border rounded-2xl shadow-[0_0_30px_rgba(74,222,128,0.06)]",
    flat: "bg-muted rounded-2xl",
  };

  return (
    <div
      className={cn(
        variants[variant],
        hover &&
          "transition-all duration-300 hover:border-green-500/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15),0_0_0_1px_rgba(74,222,128,0.08)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold leading-snug text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center px-6 pb-6 pt-0",
        className
      )}
      {...props}
    />
  );
}
