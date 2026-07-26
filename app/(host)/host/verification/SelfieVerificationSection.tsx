"use client";

import { useState } from "react";
import WebcamCapture from "@/components/common/WebcamCapture";
import { saveSelfie } from "./actions";
import { CheckCircle2, UserCheck, Clock, Camera, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface SelfieVerificationSectionProps {
  initialSelfieUrl: string | null;
  initialSelfieDate: Date | null;
  isAccountVerified: boolean;
}

export default function SelfieVerificationSection({
  initialSelfieUrl,
  initialSelfieDate,
  isAccountVerified,
}: SelfieVerificationSectionProps) {
  const router = useRouter();
  const [selfieUrl, setSelfieUrl] = useState<string | null>(initialSelfieUrl);
  const [selfieDate, setSelfieDate] = useState<Date | null>(initialSelfieDate);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRecapture, setShowRecapture] = useState(false);

  const handleSelfieCaptured = async (url: string) => {
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      await saveSelfie(url);
      setSelfieUrl(url);
      const now = new Date();
      setSelfieDate(now);
      setSuccessMessage("Selfie captured successfully! Submitted for admin face matching.");
      setShowRecapture(false);
      router.refresh();
    } catch (err: any) {
      console.error("Failed to save selfie:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400">
            <Camera className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-neutral-800 dark:text-white text-sm">Identity Selfie Verification</h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">Live facial photo capture for host authentication</p>
          </div>
        </div>

        {selfieUrl && !showRecapture ? (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              isAccountVerified
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40"
            }`}
          >
            {isAccountVerified ? (
              <>
                <CheckCircle2 className="size-3" /> Identity Verified
              </>
            ) : (
              <>
                <Clock className="size-3" /> Pending Admin Review
              </>
            )}
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full">
            Action Required
          </span>
        )}
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* View 1: Current Selfie Display */}
      {selfieUrl && !showRecapture ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-teal-500 shadow-md shrink-0 bg-neutral-900">
              <img src={selfieUrl} alt="Captured Selfie" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <p className="text-xs font-bold text-neutral-800 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
                <span>Verified Face Photo</span>
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Captured on:{" "}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {selfieDate ? new Date(selfieDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Recently"}
                </span>
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                This face photo is stored securely and compared against your official government ID document by Bokra Stay admin verifiers.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowRecapture(true)}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Recapture New Selfie
            </button>
          </div>
        </div>
      ) : (
        /* View 2: Webcam Capture Flow */
        <div className="space-y-5">
          {/* Instructions card */}
          <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 rounded-xl p-4 text-xs text-teal-900 dark:text-teal-300 space-y-2">
            <p className="font-bold flex items-center gap-1.5">
              <span>Instructions for Selfie Capture:</span>
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-teal-800 dark:text-teal-300 font-medium">
              <li className="flex items-center gap-1">❌ No glasses or sunglasses</li>
              <li className="flex items-center gap-1">❌ No earphones/headphones</li>
              <li className="flex items-center gap-1">👁️ Look directly into camera</li>
              <li className="flex items-center gap-1">💡 Ensure clear front lighting</li>
            </ul>
            <p className="text-[10px] text-teal-700/80 dark:text-teal-400/80 italic pt-1">
              Your selfie will be reviewed by our admin team alongside your government ID document.
            </p>
          </div>

          <WebcamCapture onCaptureConfirm={handleSelfieCaptured} />

          {showRecapture && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowRecapture(false)}
                className="text-xs font-semibold text-neutral-500 hover:underline cursor-pointer"
              >
                Cancel Recapture
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
