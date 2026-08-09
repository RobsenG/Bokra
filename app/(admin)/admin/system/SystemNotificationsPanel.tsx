"use client";

import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  FileText,
  XCircle,
  CheckCircle2,
  Check,
  CheckCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SystemNotification {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  propertyId: string | null;
  createdAt: string;
}

export default function SystemNotificationsPanel({
  initialNotifications,
}: {
  initialNotifications: SystemNotification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "DUPLICATE_PROPERTY":
        return <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />;
      case "NEW_LISTING":
      case "DOCUMENT_UPLOADED":
        return <FileText className="size-4 text-blue-500 shrink-0 mt-0.5" />;
      case "PROPERTY_REJECTED":
        return <XCircle className="size-4 text-red-500 shrink-0 mt-0.5" />;
      case "PROPERTY_APPROVED":
        return <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />;
      default:
        return <Bell className="size-4 text-teal-500 shrink-0 mt-0.5" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="font-bold text-neutral-800 dark:text-white text-base flex items-center gap-2">
            <Bell className="size-4 text-teal-600" />
            <span>Admin System Notifications</span>
          </h2>
          <p className="text-xs text-neutral-400">Log of security alerts, submissions, and status updates.</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCheck className="size-3.5" />
            <span>Mark all as read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No system notifications recorded.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border text-xs transition-all ${
                !notif.isRead
                  ? "bg-teal-50/40 dark:bg-teal-950/20 border-l-4 border-l-teal-500 border-teal-200/60 dark:border-teal-900/40"
                  : "bg-neutral-50/60 dark:bg-neutral-800/30 border-neutral-100 dark:border-neutral-800 opacity-80"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {renderIcon(notif.type)}
                <div className="space-y-0.5">
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!notif.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(notif.id)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-teal-600 hover:bg-teal-100/50 transition-colors cursor-pointer shrink-0"
                  title="Mark as read"
                >
                  <Check className="size-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
