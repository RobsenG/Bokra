"use client";

import { useState } from "react";
import { X, ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Building, Wallet, Smartphone } from "lucide-react";
import { requestWithdrawal } from "@/app/(host)/host/revenue/actions";
import { useRouter } from "next/navigation";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
}: WithdrawalModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [accountType, setAccountType] = useState<string>("bank");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const numAmount = Number(amount);

    if (!numAmount || isNaN(numAmount)) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }

    if (numAmount < 100) {
      setError("Minimum withdrawal amount is 100 ETB.");
      return;
    }

    if (numAmount > availableBalance) {
      setError(`Amount cannot exceed available balance of ${availableBalance.toLocaleString()} ETB.`);
      return;
    }

    if (!accountNumber.trim() || !accountName.trim()) {
      setError("Please fill in account number and account name.");
      return;
    }

    setLoading(true);

    try {
      // Simulate 1.5s delay for realistic mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await requestWithdrawal({
        amount: numAmount,
        accountType,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        note: note.trim() || undefined,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process withdrawal request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-teal-900 to-teal-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300">
              <ArrowUpRight className="size-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">Withdraw Funds</h2>
              <p className="text-xs text-teal-300/80 font-medium">Transfer earnings to your local account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/10 text-teal-200 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Available balance indicator */}
          <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 rounded-2xl p-3.5 flex items-center justify-between text-xs">
            <span className="text-teal-800 dark:text-teal-300 font-medium">Available for Payout</span>
            <span className="font-extrabold text-teal-900 dark:text-teal-200 text-sm">
              {availableBalance.toLocaleString()} ETB
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Withdrawal Amount (ETB)
            </label>
            <input
              type="number"
              min="100"
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              required
              disabled={loading || !!successMsg}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-neutral-900 dark:text-white"
            />
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Min 100 ETB</p>
          </div>

          {/* Account Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Transfer Destination
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              disabled={loading || !!successMsg}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 text-xs font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-neutral-900 dark:text-white"
            >
              <option value="bank">Bank Transfer (CBE / Dashen / Awash)</option>
              <option value="telebirr">Telebirr Mobile Money</option>
              <option value="chapa">Chapa Wallet</option>
            </select>
          </div>

          {/* Account Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Account / Phone Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={accountType === "telebirr" ? "0911223344" : "1000123456789"}
              required
              disabled={loading || !!successMsg}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-neutral-900 dark:text-white"
            />
          </div>

          {/* Account Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Account Holder Full Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Abebe Bekele"
              required
              disabled={loading || !!successMsg}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-neutral-900 dark:text-white"
            />
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Transfer Note (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly payout request"
              disabled={loading || !!successMsg}
              className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-neutral-900 dark:text-white resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 h-11 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-750 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="flex-1 h-11 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing Transfer...</span>
                </>
              ) : (
                "Request Withdrawal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
