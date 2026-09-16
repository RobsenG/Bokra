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
    <div className="bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 dark:border-[#c9a84c]/18 rounded-2xl p-5 space-y-3.5 shadow-xs font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#b8943d] dark:text-[#c9a84c] font-extrabold text-sm">
          <ShieldAlert className="size-5 text-[#b8943d] dark:text-[#c9a84c]" />
          <span>Admin Alert Feed ({notifications.length} Unread)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={loading}
            className="px-2.5 py-1 rounded-full bg-[#b8943d]/20 dark:bg-[#c9a84c]/20 hover:bg-[#b8943d]/30 text-[#b8943d] dark:text-[#c9a84c] font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
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
            className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] shadow-2xs"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold text-[#1a1208] dark:text-[#f5f0e8] leading-snug">
                  {notif.message}
                </p>
                <p className="text-[10px] text-[#6b5e4e] dark:text-[#8a8278]">
                  Logged on {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notif.propertyId && (
                <Link
                  href={`/admin/verifications/${notif.propertyId}`}
                  className="px-2.5 py-1 rounded-lg bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] font-bold text-[10px] hover:bg-[#b8943d]/20 transition-colors flex items-center gap-1"
                >
                  <span>Inspect</span>
                  <ExternalLink className="size-2.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleMarkRead(notif.id)}
                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#22c55e]/10 text-[#6b5e4e] dark:text-[#8a8278] hover:text-emerald-600 dark:hover:text-[#86efac] transition-colors cursor-pointer"
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
