"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Moon,
  Sun,
  Bell,
  Key,
  Satellite,
  Globe2,
  Shield,
  Check,
  ChevronRight,
  LogOut,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import Image from "next/image";

function SettingRow({
  icon: Icon,
  label,
  description,
  action,
  badge,
}: {
  icon: typeof User;
  label: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {badge}
      {action}
    </div>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.displayName ?? "");
  const [notifications, setNotifications] = useState({
    ndviAlerts: true,
    carbonReports: true,
    weeklyDigest: false,
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and platform preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-border bg-green-500/10 flex items-center justify-center">
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={64}
                    height={64}
                  />
                ) : (
                  <span className="text-2xl font-bold text-green-400">
                    {user?.displayName?.[0]?.toUpperCase() ??
                      user?.email?.[0]?.toUpperCase() ??
                      "U"}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {user?.displayName ?? "User"}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="green" size="sm" className="mt-1">
                  Analyst
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Display Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Input
                label="Email"
                value={user?.email ?? ""}
                disabled
                hint="Email cannot be changed here"
              />
              <div className="flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSaveProfile}>
                  <Check className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  theme === "dark"
                    ? "border-green-500/30 bg-green-500/8 text-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-green-500/20"
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-sm font-medium">Dark</span>
                {theme === "dark" && (
                  <Badge variant="green" size="sm">
                    Active
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  theme === "light"
                    ? "border-green-500/30 bg-green-500/8 text-foreground"
                    : "border-border bg-muted text-muted-foreground hover:border-green-500/20"
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-sm font-medium">Light</span>
                {theme === "light" && (
                  <Badge variant="green" size="sm">
                    Active
                  </Badge>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {[
              {
                key: "ndviAlerts" as const,
                icon: Satellite,
                label: "NDVI Alerts",
                description: "Get notified when NDVI drops below threshold",
              },
              {
                key: "carbonReports" as const,
                icon: Globe2,
                label: "Carbon Reports",
                description: "Notify when new carbon estimation is ready",
              },
              {
                key: "weeklyDigest" as const,
                icon: Bell,
                label: "Weekly Digest",
                description: "Weekly summary of all farm activities",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <SettingRow
                  key={item.key}
                  icon={Icon}
                  label={item.label}
                  description={item.description}
                  action={
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className={`relative w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                        notifications[item.key]
                          ? "bg-green-500"
                          : "bg-muted border border-border"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                          notifications[item.key] ? "left-5" : "left-1"
                        }`}
                      />
                    </button>
                  }
                />
              );
            })}
          </CardContent>
        </Card>

        {/* API & Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>API & Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            {[
              {
                icon: Key,
                label: "API Key",
                description: "Manage your CarbonIQ API access token",
                badge: <Badge variant="gray" size="sm">Coming Soon</Badge>,
              },
              {
                icon: Satellite,
                label: "Google Earth Engine",
                description: "Connect for live satellite data processing",
                badge: <Badge variant="yellow" size="sm">Planned</Badge>,
              },
              {
                icon: Globe2,
                label: "Mapbox Integration",
                description: "Premium satellite basemaps",
                badge: <Badge variant="gray" size="sm">Optional</Badge>,
              },
              {
                icon: Shield,
                label: "Carbon Verification API",
                description: "Verra / Gold Standard data export",
                badge: <Badge variant="gray" size="sm">Coming Soon</Badge>,
              },
            ].map((item) => (
              <SettingRow
                key={item.label}
                icon={item.icon}
                label={item.label}
                description={item.description}
                badge={item.badge}
                action={
                  <ChevronRight className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                }
              />
            ))}
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingRow
              icon={LogOut}
              label="Sign Out"
              description="Sign out of your CarbonIQ account"
              action={
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
