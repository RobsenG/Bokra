"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { markNotificationReadAction, markAllNotificationsReadAction } from "@/app/(admin)/admin/notifications/actions";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  propertyId: string | null;
}

export default function AdminNotificationBell({
  notifications: initialNotifications = [],
}: {
  notifications?: NotificationItem[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

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

  const unreadList = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadList.length;

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await markNotificationReadAction(id);
      router.refresh();
    } catch (err) {
      console.error("[Notifications] Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      setNotifications([]);
      await markAllNotificationsReadAction();
      router.refresh();
    } catch (err) {
      console.error("[Notifications] Failed to mark all read:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative font-sans" ref={menuRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-[#6b5e4e] dark:text-[#9b9080] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
        title={unreadCount > 0 ? `${unreadCount} unread admin alerts` : "No unread alerts"}
      >
        <Bell
          className={`size-5 ${
            unreadCount > 0
              ? "text-[#b8943d] dark:text-[#c9a84c]"
              : "text-[#6b5e4e] dark:text-[#9b9080]"
          }`}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 px-1 rounded-full bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#0a0a0f] text-[9px] font-black flex items-center justify-center shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#12121a] rounded-2xl border border-black/[0.08] dark:border-white/[0.06] shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between bg-[#f5f3ef] dark:bg-[#1a1a2e]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
              <span className="font-bold text-[#1a1208] dark:text-[#f8f6f0] text-sm">
                Admin Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] font-bold px-2 py-0.5 rounded-full border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
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
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {unreadList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6b5e4e] dark:text-[#9b9080]">
                <Bell className="size-6 text-[#6b5e4e] dark:text-[#9b9080] mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-[#1a1208] dark:text-[#f8f6f0]">All caught up!</p>
                <p className="mt-0.5">No unread notifications at this time.</p>
              </div>
            ) : (
              unreadList.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-[#1a1208] dark:text-[#f8f6f0]">
                      <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{notif.message}</span>
                    </div>
                    <p className="text-[10px] text-[#6b5e4e] dark:text-[#9b9080]">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {notif.propertyId && (
                      <Link
                        href={`/admin/verifications/${notif.propertyId}`}
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-lg bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] font-bold text-[10px] hover:bg-[#b8943d]/20 transition-colors flex items-center gap-0.5"
                        title="Inspect property detail"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="size-2.5" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className="p-1 rounded-lg text-[#6b5e4e] dark:text-[#9b9080] hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link to System Audit Log */}
          <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06] text-center bg-[#f5f3ef] dark:bg-[#1a1a2e]">
            <Link
              href="/admin/system"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#b8943d] dark:text-[#c9a84c] hover:underline"
            >
              View System Audit Feed →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
