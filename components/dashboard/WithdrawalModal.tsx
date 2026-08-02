"use client";

import { useState } from "react";
import { X, ArrowUpRight, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { requestWithdrawal } from "@/app/(host)/host/revenue/actions";
import { calculatePlatformFee, calculateNetAmount } from "@/lib/platform";
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
  const [successResult, setSuccessResult] = useState<{
    netAmount: number;
    platformFee: number;
    chapaReference: string;
    accountName: string;
    accountType: string;
  } | null>(null);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const platformFee = calculatePlatformFee(numAmount);
  const netAmount = calculateNetAmount(numAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
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
      const res = await requestWithdrawal(
        numAmount,
        accountType,
        accountNumber.trim(),
        accountName.trim(),
        note.trim() || undefined
      );

      if (res?.error) {
        setError(res.error);
        return;
      }

      if (res?.success) {
        setSuccessResult({
          netAmount: res.netAmount!,
          platformFee: res.platformFee!,
          chapaReference: res.chapaReference!,
          accountName: accountName.trim(),
          accountType,
        });
        setTimeout(() => {
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process withdrawal request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-teal-900 to-teal-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-500/20 rounded-xl text-teal-300">
              <ArrowUpRight className="size-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">Withdraw Funds</h2>
              <p className="text-xs text-teal-300/80 font-medium">Automatic instant transfer to host account</p>
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
        <div className="p-6 space-y-4">
          {successResult ? (
            /* Success Card */
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-900/40">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                  Withdrawal Processed!
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  ETB <span className="font-bold text-emerald-600 dark:text-emerald-400">{successResult.netAmount.toLocaleString()}</span> has been sent to{" "}
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{successResult.accountName}</span> ({successResult.accountType.toUpperCase()}).
                </p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{successResult.chapaReference}</span>
                </div>
                <div className="flex justify-between text-orange-600 dark:text-orange-400 font-medium">
                  <span>Platform Fee (3%):</span>
                  <span>ETB {successResult.platformFee.toLocaleString()} retained</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full h-11 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Available balance indicator */}
              <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <span className="text-teal-800 dark:text-teal-300 font-medium">Available Balance</span>
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
                  placeholder="e.g. 1000"
                  required
                  disabled={loading}
                  className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 text-sm font-semibold outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-neutral-900 dark:text-white"
                />
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Min 100 ETB</p>
              </div>

              {/* Fee Breakdown Panel */}
              {numAmount >= 100 && (
                <div className="bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl p-3.5 border border-neutral-200/80 dark:border-neutral-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>Amount Requested:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{numAmount.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600 dark:text-red-400">
                    <span>Platform Fee (3%):</span>
                    <span className="font-semibold">- {platformFee.toLocaleString()} ETB</span>
                  </div>
                  <div className="border-t border-neutral-200 dark:border-neutral-700 pt-1.5 flex justify-between items-center font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    <span>Amount You Receive:</span>
                    <span>{netAmount.toLocaleString()} ETB</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 italic pt-1">
                    This withdrawal will be processed automatically.
                  </p>
                </div>
              )}

              {/* Account Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Transfer Destination
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                  className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-neutral-900 dark:text-white resize-none"
                />
              </div>

              {/* Terms Reminder */}
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                By withdrawing, you confirm you have accepted Bokra Stay&apos;s Terms &amp; Conditions including the 3% platform service fee.
              </p>

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
                  disabled={loading}
                  className="flex-1 h-11 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Processing Auto-Payout...</span>
                    </>
                  ) : (
                    "Confirm & Withdraw"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
