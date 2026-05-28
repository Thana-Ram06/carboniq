import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/auth-context";
import { LanguageProvider } from "@/contexts/language-context";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VasudhaCarbon — Earth Intelligence Platform",
    template: "%s | VasudhaCarbon",
  },
  description:
    "VASUDHA — Earth Intelligence for a Sustainable Future. Monitor crops via satellite, estimate carbon impact, and prepare verification-ready agricultural insights using AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VASUDHA",
  },
  formatDetection: { telephone: false },
  keywords: [
    "VasudhaCarbon", "VASUDHA", "carbon intelligence",
    "agricultural carbon", "NDVI", "satellite analytics",
    "crop monitoring", "carbon credits India", "carbon sequestration",
    "farm analytics", "climate tech India", "earth intelligence",
    "MRV", "field evidence", "kisan app", "किसान",
  ],
  authors: [{ name: "VasudhaCarbon Technologies" }],
  creator: "VasudhaCarbon Technologies Pvt. Ltd.",
  openGraph: {
    title: "VasudhaCarbon — Earth Intelligence Platform",
    description:
      "Earth Intelligence for a Sustainable Future. Monitor crops, estimate carbon impact, and build verification-ready data using satellite intelligence.",
    type: "website",
    locale: "en_IN",
    siteName: "VasudhaCarbon",
  },
  twitter: {
    card: "summary_large_image",
    title: "VasudhaCarbon",
    description: "Earth Intelligence for a Sustainable Future — AI-powered agricultural carbon intelligence for India",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#040906" },
    { media: "(prefers-color-scheme: light)", color: "#f8fcf9" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <LanguageProvider>
              <ServiceWorkerRegistration />
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#080f0b",
                    color: "#e8f5ec",
                    border: "1px solid #142e1e",
                    borderRadius: "12px",
                    fontSize: "13px",
                    padding: "12px 16px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  },
                  success: {
                    iconTheme: { primary: "#4ade80", secondary: "#080f0b" },
                  },
                  error: {
                    iconTheme: { primary: "#f87171", secondary: "#080f0b" },
                  },
                }}
              />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
