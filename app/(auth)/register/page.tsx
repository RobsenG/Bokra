"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerUser } from "../actions";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Loader2, AlertCircle, Sparkles, Building, User, FileText, X } from "lucide-react";

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    role: z.enum(["RENTER", "HOST"]),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms to create an account",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const authError = searchParams.get("error");
  useEffect(() => {
    if (authError === "OAuthAccountNotLinked") {
      setError("An account with this email already exists. Please sign in instead.");
    } else if (authError) {
      setError("Google authentication failed. Please try again.");
    }
  }, [authError]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "RENTER", acceptTerms: false },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const callbackUrl = `/api/auth/role-callback?role=${selectedRole}`;
      await signIn("google", { callbackUrl });
    } catch {
      setError("Something went wrong with Google sign up. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-10 w-10 rounded-full bg-[#b8943d]/10 dark:bg-[#c9a84c]/[0.08] border border-[#b8943d]/20 dark:border-[#c9a84c]/[0.15] flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1208] dark:text-[#f5f0e8]">
            Create account
          </h1>
          <p className="text-[#9b8e7e] dark:text-[#8a8278] text-sm">
            Find or host properties across Ethiopia
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3 text-sm text-red-700 dark:text-[#fca5a5] bg-red-50 dark:bg-[rgba(239,68,68,0.08)] border border-red-200 dark:border-[rgba(239,68,68,0.15)] rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role selection */}
        <div className="space-y-2">
          <label className="label">I want to use Bokra Stay to...</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("role", "RENTER")}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedRole === "RENTER"
                  ? "border-[#b8943d] dark:border-[rgba(201,168,76,0.30)] bg-[#b8943d]/[0.08] dark:bg-[rgba(201,168,76,0.06)] text-[#b8943d] dark:text-[#c9a84c] ring-1 ring-[#b8943d]/20 dark:ring-[rgba(201,168,76,0.18)]"
                  : "border-black/[0.08] dark:border-[#fff8dc]/[0.07] hover:border-[#b8943d]/30 dark:hover:border-[rgba(201,168,76,0.25)] text-[#6b5e4e] dark:text-[#8a8278]"
              }`}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="font-semibold text-xs">Rent places</span>
              <span className="text-[10px] opacity-70">I am a guest</span>
            </button>
            <button
              type="button"
              onClick={() => setValue("role", "HOST")}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedRole === "HOST"
                  ? "border-[#b8943d] dark:border-[rgba(201,168,76,0.30)] bg-[#b8943d]/[0.08] dark:bg-[rgba(201,168,76,0.06)] text-[#b8943d] dark:text-[#c9a84c] ring-1 ring-[#b8943d]/20 dark:ring-[rgba(201,168,76,0.18)]"
                  : "border-black/[0.08] dark:border-[#fff8dc]/[0.07] hover:border-[#b8943d]/30 dark:hover:border-[rgba(201,168,76,0.25)] text-[#6b5e4e] dark:text-[#8a8278]"
              }`}
            >
              <Building className="w-5 h-5 mb-1" />
              <span className="font-semibold text-xs">Host guests</span>
              <span className="text-[10px] opacity-70">I own rentals</span>
            </button>
          </div>
        </div>

        {/* Google Sign Up Button */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium text-sm border border-black/[0.12] dark:border-[#fff8dc]/[0.12] bg-white dark:bg-[#1a1815] text-[#1a1208] dark:text-[#f5f0e8] hover:bg-black/[0.03] dark:hover:bg-[#fff8dc]/[0.05] hover:border-[#b8943d]/50 dark:hover:border-[#c9a84c]/50 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#b8943d] dark:text-[#c9a84c]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-105" />
                <span>
                  {selectedRole === "HOST"
                    ? "Sign up as Host with Google"
                    : "Sign up with Google"}
                </span>
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-[#9b8e7e] dark:text-[#8a8278]">
            By continuing with Google, you agree to our{" "}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-[#b8943d] dark:text-[#c9a84c] underline hover:opacity-80 cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            .
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/[0.08] dark:border-[#fff8dc]/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#141310] px-3 text-[#9b8e7e] dark:text-[#8a8278] font-medium tracking-wider">
              or create account with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="label">Full Name</label>
            <input
              id="name"
              placeholder="e.g. Almaz Kebede"
              className="input"
              {...register("name")}
            />
            {errors.name && <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="input"
              {...register("email")}
            />
            {errors.email && <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">{errors.email.message}</p>}
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••"
                className="input"
                {...register("password")}
              />
              {errors.password && <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                className="input"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06] space-y-1.5">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-1 h-4 w-4 rounded border-black/[0.15] dark:border-[#fff8dc]/[0.14] accent-[#b8943d] dark:accent-[#c9a84c] shrink-0 cursor-pointer"
                {...register("acceptTerms")}
              />
              <label htmlFor="acceptTerms" className="text-xs text-[#6b5e4e] dark:text-[#8a8278] leading-relaxed cursor-pointer">
                I agree to the{" "}
                <span className="font-semibold text-[#1a1208] dark:text-[#f5f0e8]">Bokra Stay Terms &amp; Conditions</span>,
                including the{" "}
                <span className="font-bold text-[#b8943d] dark:text-[#c9a84c]">3% service fee</span>{" "}
                on booking transactions.{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#b8943d] dark:text-[#c9a84c] underline font-semibold hover:opacity-80 cursor-pointer"
                >
                  View terms
                </button>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">{errors.acceptTerms.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full cursor-pointer"
            disabled={isSubmitting || isGoogleLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-center text-sm text-[#9b8e7e] dark:text-[#8a8278]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#b8943d] dark:text-[#c9a84c] hover:text-[#8a6e2a] dark:hover:text-[#d4b458] font-semibold hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1a16] border border-black/[0.08] dark:border-[#fff8dc]/[0.08] rounded-2xl max-w-lg w-full p-6 shadow-2xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] space-y-4 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-[#6b5e4e] dark:text-[#8a8278] hover:text-[#1a1208] dark:hover:text-[#f5f0e8] p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#1a1208] dark:text-[#f5f0e8] border-b border-black/[0.06] dark:border-[#fff8dc]/[0.06] pb-3">
              <FileText className="w-5 h-5 text-[#b8943d] dark:text-[#c9a84c]" />
              <h3 className="font-extrabold text-base tracking-tight">Terms &amp; Conditions</h3>
            </div>

            <div className="space-y-3.5 text-xs text-[#6b5e4e] dark:text-[#8a8278] leading-relaxed pr-1">
              {[
                {
                  title: "Service Fee",
                  body: "Bokra Stay charges a 3% service fee on booking payments. This fee is automatically deducted from host earnings before withdrawal.",
                },
                {
                  title: "Payment Processing",
                  body: "All payments are processed safely through Chapa. We don't store your card or bank details.",
                },
                {
                  title: "Withdrawals",
                  body: "Hosts can withdraw earnings at any time. Withdrawals are processed within 24 hours.",
                },
                {
                  title: "Cancellations",
                  body: "Guests can cancel up to 48 hours before check-in for a full refund.",
                },
                {
                  title: "Property Review",
                  body: "Properties are reviewed within 48 hours before going live. Hosts must upload valid ownership documents.",
                },
              ].map(({ title, body }) => (
                <div key={title}>
                  <h4 className="font-bold text-[#1a1208] dark:text-[#f5f0e8] uppercase tracking-wider text-[11px] mb-1">
                    {title}
                  </h4>
                  <p>{body}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="btn-primary w-full text-xs py-2.5 cursor-pointer"
            >
              I agree
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
