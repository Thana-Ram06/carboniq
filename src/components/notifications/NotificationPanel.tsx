"use client";

import { useEffect, useRef } from "react";
import {
  Satellite, ShieldCheck, Camera, AlertTriangle,
  FileText, Bell, Check, CheckCheck, X,
} from "lucide-react";
import type { AppNotification, NotificationType } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import type { Timestamp } from "firebase/firestore";

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  scan_complete:      { icon: Satellite,    color: "text-blue-400",   bg: "bg-blue-500/10" },
  scan_failed:        { icon: AlertTriangle, color: "text-red-400",    bg: "bg-red-500/10" },
  audit_update:       { icon: ShieldCheck,  color: "text-purple-400", bg: "bg-purple-500/10" },
  evidence_validated: { icon: Camera,       color: "text-green-400",  bg: "bg-green-500/10" },
  risk_alert:         { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
  report_ready:       { icon: FileText,     color: "text-emerald-400",bg: "bg-emerald-500/10" },
  org_invite:         { icon: Bell,         color: "text-yellow-400", bg: "bg-yellow-500/10" },
  system:             { icon: Bell,         color: "text-muted-foreground", bg: "bg-muted" },
};

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

export function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl shadow-black/30 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unread > 0 && (
            <span className="text-[10px] font-bold bg-green-500 text-white rounded-full px-1.5 py-0.5">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-foreground/5"
            >
              <CheckCheck className="w-3 h-3" />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Bell className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground/50">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 cursor-pointer hover:bg-foreground/[0.03] transition-colors ${
                  !n.read ? "bg-green-500/[0.03]" : ""
                }`}
                onClick={() => !n.read && onMarkRead(n.id)}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 mt-1">
                    {n.createdAt ? formatRelativeTime(n.createdAt as Timestamp) : "Just now"}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-green-400 hover:bg-green-500/10 transition-all shrink-0 mt-1"
                    title="Mark as read"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
