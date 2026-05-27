import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { VasudhaLogo } from "@/components/ui/vasudha-logo";

const LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Carbon Intelligence", href: "#carbon" },
    { label: "Pricing", href: "#" },
  ],
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Farm Maps", href: "/farms" },
    { label: "Satellite Analytics", href: "/satellite" },
    { label: "Reports", href: "/reports" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Data Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      {/* CTA Banner */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="relative rounded-3xl border border-green-500/15 bg-card p-12 mb-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-gradient-radial from-green-500/8 to-transparent blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h3 className="font-instrument-serif text-3xl md:text-4xl text-foreground mb-4">
              Start monitoring your farms today
            </h3>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join hundreds of farmers and agri-tech companies using VASUDHA
              to understand and quantify their carbon impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-11 px-7 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all text-sm shadow-[0_0_30px_rgba(74,222,128,0.2)]"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-11 px-7 border border-green-500/20 hover:border-green-500/35 bg-green-500/5 text-green-300 font-medium rounded-xl transition-all text-sm"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Footer grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center mb-4 group">
              <VasudhaLogo height={36} tagline={false} />
            </Link>
            <p className="text-xs text-muted-foreground/60 leading-relaxed mb-5">
              Earth Intelligence for a Sustainable Future.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: Twitter, href: "#" },
                { Icon: Github, href: "#" },
                { Icon: Linkedin, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-green-400 hover:border-green-500/20 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-4">
                {group}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground/60">
            © 2026 VasudhaCarbon Technologies Pvt. Ltd.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground/60">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
