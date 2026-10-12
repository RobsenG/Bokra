"use client";

import React, { useState } from "react";
import { DollarSign, Wallet, ArrowDownRight, CheckCircle2, X } from "lucide-react";
import { withdrawPlatformFunds } from "../../app/(finance)/finance/wallet/actions";

interface Props {
  maxBalance: number;
}

export default function PlatformWithdrawModal({ maxBalance }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number | "">("");
  const [accountType, setAccountType] = useState("Telebirr");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ message: string; reference: string } | null>(null);

  const numAmount = Number(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    if (numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (numAmount > maxBalance) {
      setError(`Amount cannot exceed available wallet balance of ${maxBalance.toLocaleString()} ETB.`);
      return;
    }

    setLoading(true);
    try {
      const res = await withdrawPlatformFunds(
        numAmount,
        accountType,
        accountNumber,
        accountName,
        note
      );

      if (res.success) {
        setSuccessResult({
          message: res.message || "Withdrawal successful!",
          reference: res.reference || "",
        });
        setAmount("");
        setAccountNumber("");
        setAccountName("");
        setNote("");
      } else {
        setError(res.error || "Withdrawal failed.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setError(null);
          setSuccessResult(null);
          setIsOpen(true);
        }}
        disabled={maxBalance <= 0}
        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#b8943d] dark:bg-[#c9a84c] text-white dark:text-[#09090f] font-bold text-sm shadow-lg shadow-[#b8943d]/20 hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Withdraw Platform Funds
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141310] rounded-2xl max-w-lg w-full p-6 border border-black/[0.08] dark:border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-3">
              <h3 className="text-base font-bold text-[#1a1208] dark:text-[#f5f0e8] flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#b8943d]" />
                Withdraw Platform Commission Funds
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#9b8e7e] hover:text-[#1a1208] dark:hover:text-[#f5f0e8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successResult ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {successResult.message}
                </h4>
                <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                  Mock Chapa Transfer Reference Number:
                </p>
                <p className="text-sm font-mono font-bold text-[#b8943d] bg-black/5 dark:bg-white/5 py-2 px-4 rounded-xl">
                  {successResult.reference}
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/5 font-semibold text-xs text-[#1a1208] dark:text-[#f5f0e8]"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-1 text-[#6b5e4e] dark:text-[#8a8278]">
                    Withdrawal Amount (Max: {maxBalance.toLocaleString()} ETB)
                  </label>
                  <input
                    type="number"
                    required
                    max={maxBalance}
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                    placeholder="e.g. 10000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8] focus:outline-none focus:ring-2 focus:ring-[#b8943d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#6b5e4e] dark:text-[#8a8278]">
                      Account Type
                    </label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8] focus:outline-none focus:ring-2 focus:ring-[#b8943d]"
                    >
                      <option value="Telebirr">Telebirr</option>
                      <option value="Bank">Bank Transfer (CBE / Awash)</option>
                      <option value="Chapa">Chapa Direct Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#6b5e4e] dark:text-[#8a8278]">
                      Account Number
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="0911223344"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8] focus:outline-none focus:ring-2 focus:ring-[#b8943d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#6b5e4e] dark:text-[#8a8278]">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Bokra Stay Treasury"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8] focus:outline-none focus:ring-2 focus:ring-[#b8943d]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#6b5e4e] dark:text-[#8a8278]">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Q4 Platform profit payout"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] bg-white dark:bg-[#0a0908] text-[#1a1208] dark:text-[#f5f0e8] focus:outline-none focus:ring-2 focus:ring-[#b8943d]"
                  />
                </div>

                {/* FEE BREAKDOWN PREVIEW */}
                <div className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6b5e4e] dark:text-[#8a8278]">Requested Amount:</span>
                    <span className="font-bold">{numAmount.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b5e4e] dark:text-[#8a8278]">Processing Fee:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      0 ETB (Platform full withdrawal)
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <span className="font-bold">Total Transferred:</span>
                    <span className="font-bold text-[#b8943d] dark:text-[#c9a84c]">
                      {numAmount.toLocaleString()} ETB
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/5 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || numAmount <= 0}
                    className="px-5 py-2 rounded-xl bg-[#b8943d] text-white dark:text-black font-semibold text-xs hover:brightness-105 disabled:opacity-50"
                  >
                    {loading ? "Processing Transfer..." : "Confirm & Transfer via Mock Chapa"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
