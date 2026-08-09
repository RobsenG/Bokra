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
    <div className="relative" ref={menuRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
        title={unreadCount > 0 ? `${unreadCount} unread admin alerts` : "No unread alerts"}
      >
        <Bell
          className={`size-5 ${
            unreadCount > 0
              ? "text-amber-600 dark:text-amber-400"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-neutral-800 dark:text-white text-sm">
                Admin Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="size-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
            {unreadList.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                <Bell className="size-6 text-neutral-300 dark:text-neutral-600 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-neutral-600 dark:text-neutral-300">All caught up!</p>
                <p className="mt-0.5">No unread notifications at this time.</p>
              </div>
            ) : (
              unreadList.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                      <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{notif.message}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {notif.propertyId && (
                      <Link
                        href={`/admin/verifications/${notif.propertyId}`}
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-bold text-[10px] hover:bg-teal-100 transition-colors flex items-center gap-0.5"
                        title="Inspect property detail"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="size-2.5" />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleMarkRead(notif.id, e)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
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
          <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 text-center bg-neutral-50/30 dark:bg-neutral-900">
            <Link
              href="/admin/system"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              View System Audit Feed →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
