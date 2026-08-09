"use client";

import { useState } from "react";
import { cancelBookingAdmin } from "./actions";
import {
  CalendarDays,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  AlertTriangle,
  Loader2,
  DollarSign,
  User,
  Building2,
} from "lucide-react";
import { PLATFORM_FEE_PERCENT, calculatePlatformFee, calculateNetAmount } from "@/lib/platform";

interface AdminBooking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  renter: {
    name: string | null;
    email: string;
    avatar: string | null;
  };
  property: {
    title: string;
    city: string;
    host: {
      name: string | null;
      email: string;
    };
  };
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
    chapaReference: string | null;
    createdAt: string;
  } | null;
}

export default function AdminBookingsClient({ bookings }: { bookings: AdminBooking[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  // Cancellation state inside modal
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.id.toLowerCase().includes(searchLower) ||
      (b.renter.name && b.renter.name.toLowerCase().includes(searchLower)) ||
      b.renter.email.toLowerCase().includes(searchLower) ||
      b.property.title.toLowerCase().includes(searchLower) ||
      b.property.city.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const totalCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setCancelError(null);

    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      setCancelError("Please provide a reason (minimum 5 characters).");
      return;
    }

    setCancelLoading(true);
    try {
      const res = await cancelBookingAdmin(selectedBooking.id, cancelReason.trim());
      if (res?.error) {
        setCancelError(res.error);
        return;
      }
      setSelectedBooking((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      setShowCancelForm(false);
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : "Failed to cancel booking.");
    } finally {
      setCancelLoading(false);
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const diff = Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Total Bookings</p>
          <p className="text-2xl font-extrabold text-neutral-800 dark:text-white mt-1">{totalCount}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Confirmed</p>
          <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{confirmedCount}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-extrabold text-orange-700 dark:text-orange-300 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 shadow-xs">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Cancelled</p>
          <p className="text-2xl font-extrabold text-red-700 dark:text-red-300 mt-1">{cancelledCount}</p>
        </div>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by renter, property, city, or booking ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/70 dark:bg-neutral-800/50 text-neutral-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Booking ID</th>
                <th className="px-5 py-3.5">Renter</th>
                <th className="px-5 py-3.5">Property</th>
                <th className="px-5 py-3.5">Host</th>
                <th className="px-5 py-3.5">Stay Dates</th>
                <th className="px-5 py-3.5">Total Amount</th>
                <th className="px-5 py-3.5">Platform Fee ({PLATFORM_FEE_PERCENT}%)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-neutral-400 text-xs">
                    No bookings match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const fee = calculatePlatformFee(b.totalPrice);
                  const nights = calculateNights(b.checkIn, b.checkOut);

                  return (
                    <tr key={b.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                      {/* ID */}
                      <td className="px-5 py-4 font-mono font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">
                        #{b.id.substring(0, 8)}
                      </td>

                      {/* Renter */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                            {(b.renter.name || b.renter.email).substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-800 dark:text-white line-clamp-1">{b.renter.name || "N/A"}</p>
                            <p className="text-[10px] text-neutral-400">{b.renter.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Property */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-800 dark:text-white line-clamp-1">{b.property.title}</p>
                        <p className="text-[10px] text-neutral-400">{b.property.city}</p>
                      </td>

                      {/* Host */}
                      <td className="px-5 py-4 text-neutral-700 dark:text-neutral-300 font-medium">
                        {b.property.host.name || b.property.host.email}
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-medium text-neutral-800 dark:text-white">
                          {new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-normal">({nights} night{nights > 1 ? "s" : ""})</span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 font-extrabold text-neutral-800 dark:text-white whitespace-nowrap">
                        {b.totalPrice.toLocaleString()} ETB
                      </td>

                      {/* Platform Fee */}
                      <td className="px-5 py-4 font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                        +{fee.toLocaleString()} ETB
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : b.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                              : b.status === "CANCELLED"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                              : "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            b.payment?.status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700"
                              : b.payment?.status === "FAILED"
                              ? "bg-red-50 text-red-700"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {b.payment?.status || "UNPAID"}
                        </span>
                      </td>

                      {/* View Details CTA */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setShowCancelForm(false);
                            setCancelError(null);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="size-3.5 text-teal-600" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKING DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-neutral-800 dark:text-white flex items-center gap-2">
                  <span>Booking #{selectedBooking.id.substring(0, 8)}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                    {selectedBooking.status}
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">Booked on {new Date(selectedBooking.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Renter & Host Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <User className="size-3 text-teal-600" /> Renter Information
                </span>
                <p className="font-bold text-neutral-800 dark:text-white">{selectedBooking.renter.name || "N/A"}</p>
                <p className="text-neutral-500">{selectedBooking.renter.email}</p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Building2 className="size-3 text-teal-600" /> Host & Property
                </span>
                <p className="font-bold text-neutral-800 dark:text-white line-clamp-1">{selectedBooking.property.title}</p>
                <p className="text-neutral-500">Host: {selectedBooking.property.host.name || selectedBooking.property.host.email}</p>
              </div>
            </div>

            {/* Payment & Fee Breakdown */}
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-neutral-700 dark:text-neutral-200 flex items-center gap-1">
                <DollarSign className="size-3.5 text-teal-600" /> Financial Breakdown ({PLATFORM_FEE_PERCENT}% Platform Fee)
              </span>
              <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-700">
                <span className="text-neutral-500">Gross Total (Renter Paid)</span>
                <span className="font-bold text-neutral-800 dark:text-white">{selectedBooking.totalPrice.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-700 text-teal-600 font-semibold">
                <span>Platform Service Fee ({PLATFORM_FEE_PERCENT}%)</span>
                <span>+{calculatePlatformFee(selectedBooking.totalPrice).toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between py-1 font-extrabold text-neutral-800 dark:text-white">
                <span>Net Host Payout (97%)</span>
                <span>{calculateNetAmount(selectedBooking.totalPrice).toLocaleString()} ETB</span>
              </div>
              {selectedBooking.payment?.chapaReference && (
                <p className="text-[10px] text-neutral-400 pt-1 font-mono">
                  Chapa Reference: {selectedBooking.payment.chapaReference}
                </p>
              )}
            </div>

            {/* Admin Cancellation Action */}
            {selectedBooking.status === "CONFIRMED" && (
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                {showCancelForm ? (
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-900/40 space-y-3">
                    <p className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                      <AlertTriangle className="size-4 text-red-600" />
                      Admin Dispute Cancellation
                    </p>
                    {cancelError && (
                      <p className="text-[11px] font-semibold text-red-600">{cancelError}</p>
                    )}
                    <textarea
                      rows={2}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for admin cancellation (e.g. Host requested cancellation due to maintenance dispute)..."
                      className="w-full p-2.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-neutral-900 text-xs outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCancelForm(false)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold border border-neutral-200 text-neutral-600"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCancelBooking}
                        disabled={cancelLoading}
                        className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-1"
                      >
                        {cancelLoading ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm Admin Cancel"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelForm(true)}
                    className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel Booking as Admin (Dispute Resolution)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
