"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Building2,
  ExternalLink,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  propertyId: string | null;
}

export default function NotificationBell({
  initialNotifications = [],
}: {
  initialNotifications?: NotificationItem[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from API endpoint
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("[NotificationBell] Failed to fetch notifications:", err);
    }
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await fetch("/api/admin/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } catch (err) {
      console.error("[NotificationBell] Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetch("/api/admin/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      router.refresh();
    } catch (err) {
      console.error("[NotificationBell] Failed to mark all read:", err);
    } fontFinally: {
      setLoading(false);
    }
  };

  const getNotifIcon = (type: string) => {
    if (type.includes("DUPLICATE") || type.includes("WARNING")) {
      return <AlertTriangle className="size-4 text-amber-500 shrink-0" />;
    }
    if (type.includes("PROPERTY") || type.includes("LISTING")) {
      return <Building2 className="size-4 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />;
    }
    if (type.includes("DOCUMENT")) {
      return <FileText className="size-4 text-blue-500 shrink-0" />;
    }
    return <Info className="size-4 text-[#b8943d] dark:text-[#c9a84c] shrink-0" />;
  };

  return (
    <div className="relative font-sans" ref={menuRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-[#6b5e4e] dark:text-[#8a8278] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <Bell
          className={`size-5 ${
            unreadCount > 0
              ? "text-[#b8943d] dark:text-[#c9a84c]"
              : "text-[#6b5e4e] dark:text-[#8a8278]"
          }`}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#141310] rounded-3xl border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] flex items-center justify-between bg-[#faf9f7] dark:bg-[#1c1a16]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
              <span className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold px-2 py-0.5 rounded-full border border-red-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-black/[0.05] dark:divide-[#fff8dc]/[0.04]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                <Bell className="size-6 text-[#9b8e7e] mx-auto mb-2 opacity-40" />
                <p className="font-bold text-[#1a1208] dark:text-[#f5f0e8]">No notifications</p>
                <p className="mt-0.5">You have no system alerts at this time.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const timeAgo = new Date(notif.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={notif.id}
                    onClick={(e) => {
                      if (!notif.isRead) handleMarkRead(notif.id, e);
                      if (notif.propertyId) {
                        setIsOpen(false);
                        router.push(`/admin/verifications/${notif.propertyId}`);
                      }
                    }}
                    className={`p-4 transition-colors flex items-start gap-3 text-xs cursor-pointer ${
                      !notif.isRead
                        ? "bg-[#b8943d]/[0.04] dark:bg-[#c9a84c]/[0.04] border-l-4 border-l-[#b8943d] dark:border-l-[#c9a84c]"
                        : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    }`}
                  >
                    {getNotifIcon(notif.type)}

                    <div className="space-y-1 flex-1 min-w-0">
                      <p
                        className={`text-xs leading-snug line-clamp-2 ${
                          !notif.isRead
                            ? "font-bold text-[#1a1208] dark:text-[#f5f0e8]"
                            : "text-[#6b5e4e] dark:text-[#8a8278]"
                        }`}
                      >
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-[#9b8e7e] dark:text-[#6b6257]">
                        {timeAgo}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkRead(notif.id, e)}
                          className="p-1 rounded-lg text-[#9b8e7e] hover:text-emerald-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      {notif.propertyId && <ExternalLink className="size-3 text-[#9b8e7e]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.05] text-center bg-[#faf9f7] dark:bg-[#1c1a16]">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
