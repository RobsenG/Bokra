"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerUser } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, AlertCircle, Sparkles, Building, User, FileText, X } from "lucide-react";

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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 p-3 text-sm text-red-700 dark:text-[#fca5a5] bg-red-50 dark:bg-[rgba(239,68,68,0.08)] border border-red-200 dark:border-[rgba(239,68,68,0.15)] rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

          {/* Role selection */}
          <div className="space-y-2.5 pt-2 border-t border-black/[0.06] dark:border-[#fff8dc]/[0.06]">
            <label className="label">I want to use Bokra Stay to...</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "RENTER")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === "RENTER"
                    ? "border-[#b8943d] dark:border-[rgba(201,168,76,0.30)] bg-[#b8943d]/[0.08] dark:bg-[rgba(201,168,76,0.06)] text-[#b8943d] dark:text-[#c9a84c] ring-1 ring-[#b8943d]/20 dark:ring-[rgba(201,168,76,0.18)]"
                    : "border-black/[0.08] dark:border-[#fff8dc]/[0.07] hover:border-[#b8943d]/30 dark:hover:border-[rgba(201,168,76,0.25)] text-[#6b5e4e] dark:text-[#8a8278]"
                }`}
              >
                <User className="w-5 h-5 mb-1.5" />
                <span className="font-semibold text-xs">Rent places</span>
                <span className="text-[10px] opacity-70 mt-0.5">I am a guest</span>
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "HOST")}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedRole === "HOST"
                    ? "border-[#b8943d] dark:border-[rgba(201,168,76,0.30)] bg-[#b8943d]/[0.08] dark:bg-[rgba(201,168,76,0.06)] text-[#b8943d] dark:text-[#c9a84c] ring-1 ring-[#b8943d]/20 dark:ring-[rgba(201,168,76,0.18)]"
                    : "border-black/[0.08] dark:border-[#fff8dc]/[0.07] hover:border-[#b8943d]/30 dark:hover:border-[rgba(201,168,76,0.25)] text-[#6b5e4e] dark:text-[#8a8278]"
                }`}
              >
                <Building className="w-5 h-5 mb-1.5" />
                <span className="font-semibold text-xs">Host guests</span>
                <span className="text-[10px] opacity-70 mt-0.5">I own rentals</span>
              </button>
            </div>
          </div>

          {/* Terms */}
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
            disabled={isSubmitting}
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
