"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";

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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const registered = searchParams.get("registered") === "true";
  const message = searchParams.get("message");
  const authError = searchParams.get("error");

  useEffect(() => {
    if (authError === "OAuthAccountNotLinked") {
      setError("An account with this email already exists. Sign in with your password to link accounts.");
    } else if (authError === "OAuthCallback" || authError === "OAuthSignin") {
      setError("Could not complete Google authentication. Please try again.");
    } else if (authError) {
      setError("Authentication failed. Please try again.");
    }
  }, [authError]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Wrong email or password. Try again.");
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      await signIn("google", { callbackUrl });
    } catch {
      setError("Something went wrong with Google sign in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#141310] rounded-2xl border border-black/[0.08] dark:border-[#fff8dc]/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1208] dark:text-[#f5f0e8]">
          Welcome back
        </h1>
        <p className="text-[#9b8e7e] dark:text-[#8a8278] text-sm">
          Sign in to your account to continue
        </p>
      </div>

      {/* Banners */}
      {registered && (
        <div className="flex items-center gap-2.5 p-3 text-sm text-emerald-800 dark:text-[#86efac] bg-emerald-50 dark:bg-[rgba(34,197,94,0.08)] border border-emerald-200 dark:border-[rgba(34,197,94,0.15)] rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-[#86efac]" />
          <span>You&apos;re all set! Sign in to get started</span>
        </div>
      )}

      {message && !registered && (
        <div className="flex items-center gap-2.5 p-3 text-sm text-[#b8943d] dark:text-[#c9a84c] bg-[#b8943d]/[0.08] dark:bg-[rgba(201,168,76,0.08)] border border-[#b8943d]/20 dark:border-[rgba(201,168,76,0.15)] rounded-xl">
          <Info className="w-4 h-4 shrink-0" />
          <span>{decodeURIComponent(message)}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3 text-sm text-red-700 dark:text-[#fca5a5] bg-red-50 dark:bg-[rgba(239,68,68,0.08)] border border-red-200 dark:border-[rgba(239,68,68,0.15)] rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-[#fca5a5]" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
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
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-black/[0.08] dark:border-[#fff8dc]/[0.08]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-[#141310] px-3 text-[#9b8e7e] dark:text-[#8a8278] font-medium tracking-wider">
            or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            className="input"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#b8943d] dark:text-[#c9a84c] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="input"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs font-medium text-red-500 dark:text-[#fca5a5]">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full mt-2 cursor-pointer"
          disabled={isSubmitting || isGoogleLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing you in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="pt-4 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06] text-center text-sm text-[#9b8e7e] dark:text-[#8a8278]">
        New to Bokra Stay?{" "}
        <Link
          href="/register"
          className="text-[#b8943d] dark:text-[#c9a84c] hover:text-[#8a6e2a] dark:hover:text-[#d4b458] font-semibold hover:underline"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
