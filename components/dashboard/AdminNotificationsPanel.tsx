"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Check, ShieldAlert, CheckCheck, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/app/(admin)/admin/notifications/actions";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  propertyId: string | null;
}

export default function AdminNotificationsPanel({
  initialNotifications,
}: {
  initialNotifications: NotificationItem[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await markNotificationReadAction(id);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      setNotifications([]);
      await markAllNotificationsReadAction();
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
          <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400" />
          <span>Admin Alert Feed ({notifications.length} Unread)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-900/80 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
          >
            <CheckCheck className="size-3" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-amber-200/60 dark:border-amber-900/40 shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 leading-snug">
                  {notif.message}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  Logged on {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notif.propertyId && (
                <Link
                  href={`/admin/verifications/${notif.propertyId}`}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-bold text-[10px] hover:bg-teal-100 transition-colors flex items-center gap-1"
                >
                  <span>Inspect</span>
                  <ExternalLink className="size-2.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleMarkRead(notif.id)}
                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-neutral-400 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Mark alert as read"
              >
                <Check className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
