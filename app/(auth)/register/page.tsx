"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerUser } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, AlertCircle, Sparkles, Building, User, FileText, X } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
  role: z.enum(["RENTER", "HOST"]),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to create an account",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "RENTER",
      acceptTerms: false,
    }
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
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Card className="w-full border-[#e5e7eb] shadow-[0_1px_3px_0_rgb(0_0_0_/_0.08)] bg-white rounded-2xl p-2 sm:p-4">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto h-10 w-10 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mb-1">
            <Sparkles className="w-5 h-5 text-[#7c3aed]" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-[#111827]">
            Create account
          </CardTitle>
          <CardDescription className="text-[#6b7280]">
            Find or host properties across Ethiopia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Full Name
              </label>
              <input 
                id="name" 
                placeholder="e.g. Almaz Kebede" 
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all duration-200"
                {...register("name")} 
              />
              {errors.name && (
                <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                Email
              </label>
              <input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all duration-200"
                {...register("email")} 
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                  Password
                </label>
                <input 
                  id="password" 
                  type="password" 
                  placeholder="••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all duration-200"
                  {...register("password")} 
                />
                {errors.password && (
                  <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                  Confirm Password
                </label>
                <input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#e5e7eb] text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 focus:border-[#7c3aed] transition-all duration-200"
                  {...register("confirmPassword")} 
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-[#e5e7eb]">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                I want to use Bokra Stay to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setValue("role", "RENTER")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === "RENTER" 
                      ? "border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed] ring-2 ring-[#7c3aed]/20 font-semibold" 
                      : "border-[#e5e7eb] hover:bg-[#f8fafc] text-[#6b7280]"
                  }`}
                >
                  <User className="w-5 h-5 mb-1.5" />
                  <span className="font-semibold text-xs">Rent places</span>
                  <span className="text-[10px] opacity-75 mt-0.5">I am a guest</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setValue("role", "HOST")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === "HOST" 
                      ? "border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed] ring-2 ring-[#7c3aed]/20 font-semibold" 
                      : "border-[#e5e7eb] hover:bg-[#f8fafc] text-[#6b7280]"
                  }`}
                >
                  <Building className="w-5 h-5 mb-1.5" />
                  <span className="font-semibold text-xs">Host guests</span>
                  <span className="text-[10px] opacity-75 mt-0.5">I own rentals</span>
                </button>
              </div>
              {errors.role && (
                <p className="text-xs font-medium text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-2 border-t border-[#e5e7eb] space-y-1.5">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-1 h-4 w-4 rounded border-[#e5e7eb] text-[#7c3aed] focus:ring-[#7c3aed] cursor-pointer accent-[#7c3aed] shrink-0"
                  {...register("acceptTerms")}
                />
                <label htmlFor="acceptTerms" className="text-xs text-[#6b7280] leading-relaxed cursor-pointer">
                  I agree to the <span className="font-semibold text-[#111827]">Bokra Stay Terms & Conditions</span>, including the <span className="font-bold text-[#7c3aed]">3% service fee</span> on booking transactions.{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-[#7c3aed] underline font-semibold hover:text-[#5b21b6] cursor-pointer"
                  >
                    View terms
                  </button>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs font-medium text-red-500">{errors.acceptTerms.message}</p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#7c3aed] hover:bg-[#5b21b6] active:bg-[#4c1d95] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] hover:shadow-[0_6px_20px_0_rgb(124_58_237/_0.35)] transition-all duration-200 disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center gap-2" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-4 pt-4 border-t border-[#e5e7eb]">
          <div className="text-sm text-[#6b7280]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#7c3aed] hover:text-[#5b21b6] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-[#6b7280] hover:text-[#111827] p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 text-[#111827] border-b border-[#e5e7eb] pb-3">
              <FileText className="w-5 h-5 text-[#7c3aed]" />
              <h3 className="font-extrabold text-base tracking-tight">
                Terms & Conditions
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-[#6b7280] leading-relaxed pr-1">
              <div>
                <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[11px] mb-1">
                  Service Fee
                </h4>
                <p>
                  Bokra Stay charges a 3% service fee on booking payments. This fee is automatically deducted from host earnings before withdrawal.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[11px] mb-1">
                  Payment Processing
                </h4>
                <p>
                  All payments are processed safely through Chapa. We don&apos;t store your card or bank details.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[11px] mb-1">
                  Withdrawals
                </h4>
                <p>
                  Hosts can withdraw earnings at any time. Withdrawals are processed within 24 hours.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[11px] mb-1">
                  Cancellations
                </h4>
                <p>
                  Guests can cancel up to 48 hours before check-in for a full refund.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[11px] mb-1">
                  Property Review
                </h4>
                <p>
                  Properties are reviewed within 48 hours before going live. Hosts must upload valid ownership documents.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-[#7c3aed] hover:bg-[#5b21b6] text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-all"
              >
                I agree
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
