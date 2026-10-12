"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/app/(auth)/actions";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((v) => /[A-Z]/.test(v), "Password must contain at least one uppercase letter")
      .refine((v) => /[0-9]/.test(v), "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/forgot-password");
    }
  }, [token, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password", "");

  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      setError("This reset link has expired or is invalid. Request a new one.");
      return;
    }
    setError("");
    try {
      const res = await resetPassword(token, data.password);
      if (res?.error) {
        setError(res.error);
      } else {
        const msg = encodeURIComponent("Password reset successfully! Sign in with your new password.");
        router.push(`/login?message=${msg}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="w-full bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1208] dark:text-[#f5f0e8]">
          Reset your password
        </h1>
        <p className="text-[#9b8e7e] dark:text-[#8a8278] text-sm">
          Enter your new password below
        </p>
      </div>

      {error ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-4 text-sm text-red-700 dark:text-[#fca5a5] bg-red-50 dark:bg-[rgba(239,68,68,0.08)] border border-red-200 dark:border-[rgba(239,68,68,0.15)] rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-[#fca5a5] mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{error}</p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm text-[#b8943d] dark:text-[#c9a84c] hover:underline font-semibold"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="label">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="label">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password Requirements Checklist */}
        <div className="p-3 bg-[#faf9f7] dark:bg-[rgba(255,255,255,0.03)] border border-black/[0.06] dark:border-white/[0.06] rounded-xl text-xs space-y-1.5">
          <p className="font-semibold text-[#1a1208] dark:text-[#f5f0e8] mb-1">
            Password requirements:
          </p>
          <div className="flex items-center gap-2 text-[#6b5e4e] dark:text-[#a09484]">
            <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinLength ? "text-emerald-500" : "text-neutral-300 dark:text-neutral-600"}`} />
            <span className={hasMinLength ? "text-emerald-700 dark:text-emerald-400" : ""}>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-2 text-[#6b5e4e] dark:text-[#a09484]">
            <CheckCircle2 className={`w-3.5 h-3.5 ${hasUppercase ? "text-emerald-500" : "text-neutral-300 dark:text-neutral-600"}`} />
            <span className={hasUppercase ? "text-emerald-700 dark:text-emerald-400" : ""}>At least one uppercase letter</span>
          </div>
          <div className="flex items-center gap-2 text-[#6b5e4e] dark:text-[#a09484]">
            <CheckCircle2 className={`w-3.5 h-3.5 ${hasNumber ? "text-emerald-500" : "text-neutral-300 dark:text-neutral-600"}`} />
            <span className={hasNumber ? "text-emerald-700 dark:text-emerald-400" : ""}>At least one number</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-2 cursor-pointer"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Resetting password...
            </>
          ) : (
            "Reset Password"
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
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
