"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const registered = searchParams.get("registered") === "true";
  const message = searchParams.get("message");

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

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "HOST") router.push("/host/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/renter/bookings");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2.5 p-3 text-sm text-red-700 dark:text-[#fca5a5] bg-red-50 dark:bg-[rgba(239,68,68,0.08)] border border-red-200 dark:border-[rgba(239,68,68,0.15)] rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-[#fca5a5]" />
            <span>{error}</span>
          </div>
        )}

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
          <label htmlFor="password" className="label">Password</label>
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
          disabled={isSubmitting}
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
