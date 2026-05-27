"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VasudhaLogo } from "@/components/ui/vasudha-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-8">
          <VasudhaLogo height={40} tagline={false} />
        </div>
        <h1 className="font-instrument-serif text-5xl text-foreground mb-3">404</h1>
        <p className="text-muted-foreground mb-8">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-10 px-6 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-medium hover:bg-green-500/15 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
