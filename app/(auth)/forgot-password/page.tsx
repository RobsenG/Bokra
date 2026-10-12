"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { forgotPassword } from "@/app/(auth)/actions";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setError("");
    try {
      const res = await forgotPassword(data.email);
      if (res?.error) {
        setError(res.error);
      } else {
        setSubmittedEmail(data.email);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1208] dark:text-[#f5f0e8]">
          Forgot your password?
        </h1>
        <p className="text-[#9b8e7e] dark:text-[#8a8278] text-sm">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {submittedEmail ? (
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 text-sm text-emerald-800 dark:text-[#86efac] bg-emerald-50 dark:bg-[rgba(34,197,94,0.08)] border border-emerald-200 dark:border-[rgba(34,197,94,0.15)] rounded-xl">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-[#86efac] mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Check your email!</p>
              <p className="text-emerald-700 dark:text-[#a7f3d0]">
                We&apos;ve sent a password reset link to <strong className="font-bold">{submittedEmail}</strong>. It expires in 1 hour.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[#b8943d] dark:text-[#c9a84c] hover:underline font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 p-3 text-sm text-red-700 dark:text-[#fca5a5] bg-red-50 dark:bg-[rgba(239,68,68,0.08)] border border-red-200 dark:border-[rgba(239,68,68,0.15)] rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-[#fca5a5]" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <div className="pt-4 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[#9b8e7e] dark:text-[#8a8278] hover:text-[#1a1208] dark:hover:text-[#f5f0e8]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
