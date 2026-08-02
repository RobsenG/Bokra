"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    message: "You must agree to the Terms & Conditions to register",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
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

      // SUCCESS: redirect to /login with success banner
      router.push("/login?registered=true");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <>
      <Card className="w-full border-teal-100 dark:border-neutral-800 shadow-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mb-1">
            <Sparkles className="size-5 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-teal-950 dark:text-neutral-50">
            Create an account
          </CardTitle>
          <CardDescription className="text-neutral-500 dark:text-neutral-400">
            Join Bokra Stay to discover or host premium properties in Ethiopia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-teal-950 dark:text-neutral-300 font-medium">
                Full Name
              </Label>
              <Input 
                id="name" 
                placeholder="e.g. Almaz Kebede" 
                className="border-neutral-200 dark:border-neutral-800 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                {...register("name")} 
              />
              {errors.name && (
                <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-teal-950 dark:text-neutral-300 font-medium">
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="border-neutral-200 dark:border-neutral-800 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                {...register("email")} 
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-teal-950 dark:text-neutral-300 font-medium">
                  Password
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••"
                  className="border-neutral-200 dark:border-neutral-800 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                  {...register("password")} 
                />
                {errors.password && (
                  <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-teal-950 dark:text-neutral-300 font-medium">
                  Confirm Password
                </Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••"
                  className="border-neutral-200 dark:border-neutral-800 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
                  {...register("confirmPassword")} 
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
              <Label className="text-teal-950 dark:text-neutral-300 font-semibold text-sm">
                I want to use Bokra Stay to...
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => setValue("role", "RENTER")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === "RENTER" 
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20" 
                      : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <User className="size-5 mb-1.5" />
                  <span className="font-semibold text-xs">Rent places</span>
                  <span className="text-[10px] opacity-75 mt-0.5">I am a traveler/guest</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setValue("role", "HOST")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === "HOST" 
                      ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20" 
                      : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <Building className="size-5 mb-1.5" />
                  <span className="font-semibold text-xs">Host guests</span>
                  <span className="text-[10px] opacity-75 mt-0.5">I own short-term rentals</span>
                </button>
              </div>
              {errors.role && (
                <p className="text-xs font-medium text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* MODIFICATION 1: Required Terms & Conditions Checkbox */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 space-y-1.5">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600 shrink-0"
                  {...register("acceptTerms")}
                />
                <label htmlFor="acceptTerms" className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed cursor-pointer">
                  I agree to the <span className="font-semibold text-neutral-800 dark:text-neutral-200">Bokra Stay Terms & Conditions</span>, including the <span className="font-bold text-teal-700 dark:text-teal-300">3% platform service fee</span> applied to every booking transaction.{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-teal-600 dark:text-teal-400 underline font-semibold hover:text-teal-700 cursor-pointer"
                  >
                    View full terms
                  </button>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs font-medium text-red-500">{errors.acceptTerms.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-2 rounded-lg transition-all shadow-md shadow-teal-600/10 hover:shadow-lg hover:shadow-teal-600/20 mt-4 cursor-pointer" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 text-teal-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <FileText className="size-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-extrabold text-base tracking-tight">
                BOKRA STAY PLATFORM TERMS & CONDITIONS
              </h3>
            </div>

            <div className="space-y-3.5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed pr-1">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Platform Service Fee
                </h4>
                <p>
                  Bokra Stay charges a 3% service fee on every successful booking payment. This fee is automatically deducted from host earnings before withdrawal. Renters pay the full listed price.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Payment Processing
                </h4>
                <p>
                  All payments are processed through Chapa payment gateway. Bokra Stay does not store card or bank details.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Withdrawal Policy
                </h4>
                <p>
                  Hosts may withdraw their available balance (total earnings minus 3% platform fee minus previous withdrawals) at any time. Withdrawals are processed automatically within 24 hours.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Cancellation Policy
                </h4>
                <p>
                  Renters may cancel bookings up to 48 hours before check-in for a full refund. Cancellations within 48 hours are non-refundable.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Property Verification
                </h4>
                <p>
                  All properties must be verified by a Bokra Stay administrator before going live. Hosts must provide valid ownership documents.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Identity Verification
                </h4>
                <p>
                  Hosts must complete identity verification including a live selfie and valid government-issued ID before listing properties.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                  Conduct
                </h4>
                <p>
                  Any fraudulent activity, fake listings, or policy violations will result in immediate account suspension.
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 font-medium">
                © 2026 Bokra Stay — Wachemo University Final Year Project
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 rounded-xl cursor-pointer"
              >
                I Understand & Agree
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
