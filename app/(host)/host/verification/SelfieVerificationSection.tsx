"use client";

import { useState } from "react";
import WebcamCapture from "@/components/common/WebcamCapture";
import { saveSelfie } from "./actions";
import { CheckCircle2, Clock, Camera, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface SelfieVerificationSectionProps {
  initialSelfieUrl: string | null;
  initialSelfieDate: Date | string | null;
  isAccountVerified: boolean;
}

export default function SelfieVerificationSection({
  initialSelfieUrl,
  initialSelfieDate,
  isAccountVerified,
}: SelfieVerificationSectionProps) {
  const router = useRouter();
  const [selfieUrl, setSelfieUrl] = useState<string | null>(initialSelfieUrl);
  const [selfieDate, setSelfieDate] = useState<Date | string | null>(initialSelfieDate);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSelfieCaptured = async (url: string) => {
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      await saveSelfie(url);
      setSelfieUrl(url);
      const now = new Date();
      setSelfieDate(now);
      setSuccessMessage("Selfie captured successfully! Submitted for admin face matching.");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to save selfie:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // RULE: If admin has verified this user AND selfieUrl exists, show LOCKED card only.
  // HIDE webcam capture component completely. HIDE any retake or change button.
  if (isAccountVerified && selfieUrl) {
    return (
      <div className="bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Camera className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
                Identity Selfie Verification
              </h2>
              <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                Verified facial photo record
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
            Selfie Verified by Admin
          </span>
        </div>

        {/* Locked Card */}
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#faf9f7] dark:bg-[#1c1a16] p-5 rounded-2xl border border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#b8943d] dark:border-[#c9a84c] shadow-md shrink-0 bg-neutral-900">
            <img src={selfieUrl} alt="Verified Selfie" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-extrabold text-[#1a1208] dark:text-[#f5f0e8]">
              <Lock className="size-4 text-[#b8943d] dark:text-[#c9a84c]" />
              <span>Face Photo Locked &amp; Verified</span>
            </div>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Captured on:{" "}
              <span className="font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
                {selfieDate ? new Date(selfieDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Verified"}
              </span>
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2 text-left font-medium">
              <Lock className="size-4 shrink-0 text-amber-600 dark:text-[#fcd34d] mt-0.5" />
              <span>
                Your selfie has been verified by our team. It cannot be changed after verification.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View when not yet verified: Show Webcam capture flow or current submitted selfie before review
  return (
    <div className="bg-white dark:bg-[#141310] border border-black/[0.08] dark:border-[#fff8dc]/[0.06] rounded-2xl p-6 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-[#fff8dc]/[0.05] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c]">
            <Camera className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] text-sm">
              Identity Selfie Verification
            </h2>
            <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
              Live facial photo capture for host authentication
            </p>
          </div>
        </div>

        {selfieUrl ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
            <Clock className="size-3.5" /> Pending Admin Review
          </span>
        ) : (
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 text-[#b8943d] dark:text-[#c9a84c] px-3 py-1 rounded-full border border-[#b8943d]/20 dark:border-[#c9a84c]/20">
            Action Required
          </span>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {selfieUrl ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#faf9f7] dark:bg-[#1c1a16] p-4 rounded-2xl border border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#b8943d] dark:border-[#c9a84c] shadow-md shrink-0 bg-neutral-900">
              <img src={selfieUrl} alt="Submitted Selfie" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <p className="text-xs font-bold text-[#1a1208] dark:text-[#f5f0e8] flex items-center justify-center sm:justify-start gap-1.5">
                <span>Submitted Selfie Photo</span>
                <Clock className="size-4 text-amber-500" />
              </p>
              <p className="text-xs text-[#6b5e4e] dark:text-[#8a8278]">
                Captured on:{" "}
                <span className="font-semibold text-[#1a1208] dark:text-[#f5f0e8]">
                  {selfieDate ? new Date(selfieDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Recently"}
                </span>
              </p>
              <p className="text-[11px] text-[#9b8e7e] dark:text-[#8a8278]">
                This face photo is stored securely and compared against your official government ID document by Bokra Stay admin verifiers.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-[#b8943d]/10 dark:bg-[#c9a84c]/10 border border-[#b8943d]/20 dark:border-[#c9a84c]/20 rounded-xl p-4 text-xs text-[#1a1208] dark:text-[#f5f0e8] space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-[#b8943d] dark:text-[#c9a84c]">
              <span>Instructions for Selfie Capture:</span>
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-medium text-[#6b5e4e] dark:text-[#d4cfc7]">
              <li>❌ No glasses or sunglasses</li>
              <li>❌ No earphones/headphones</li>
              <li>👁️ Look directly into camera</li>
              <li>💡 Ensure clear front lighting</li>
            </ul>
          </div>

          <WebcamCapture onCaptureConfirm={handleSelfieCaptured} />
        </div>
      )}
    </div>
  );
}
