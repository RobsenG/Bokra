"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

interface AdminNotificationBellProps {
  unreadCount: number;
}

export default function AdminNotificationBell({ unreadCount: initialCount }: AdminNotificationBellProps) {
  const [count, setCount] = useState(initialCount);
  const [pulse, setPulse] = useState(initialCount > 0);

  // Stop pulse animation after 4 seconds
  useEffect(() => {
    if (pulse) {
      const timer = setTimeout(() => setPulse(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [pulse]);

  return (
    <Link
      href="/admin/dashboard"
      className="relative p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      title={count > 0 ? `${count} unread admin alert${count !== 1 ? "s" : ""}` : "No new alerts"}
    >
      <Bell
        className={`size-5 ${count > 0 ? "text-amber-600 dark:text-amber-400" : "text-neutral-400 dark:text-neutral-500"}`}
      />

      {count > 0 && (
        <>
          {/* Unread badge */}
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
            {count > 99 ? "99+" : count}
          </span>

          {/* Pulse ring */}
          {pulse && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-amber-400 animate-ping opacity-60" />
          )}
        </>
      )}
    </Link>
  );
}
