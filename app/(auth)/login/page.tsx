"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    try {
      // Use client-side signIn from next-auth/react — returns a result object, never throws
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please check your credentials.");
        return;
      }

      // Fetch session to get the role for redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "HOST") {
        router.push("/host/dashboard");
      } else if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/renter/bookings");
      }
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full border-teal-100 dark:border-neutral-800 shadow-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center pb-6">
        <CardTitle className="text-3xl font-extrabold tracking-tight text-teal-950 dark:text-neutral-50">
          Welcome back
        </CardTitle>
        <CardDescription className="text-neutral-500 dark:text-neutral-400">
          Enter your credentials to access your Bokra Stay account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Green success banner after registration */}
        {registered && (
          <div className="flex items-center gap-2.5 p-3 text-sm text-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 rounded-lg">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Account created successfully! Please sign in.</span>
          </div>
        )}

        {/* Info banner for other messages (e.g. search redirect) */}
        {message && !registered && (
          <div className="flex items-center gap-2.5 p-3 text-sm text-blue-800 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 rounded-lg">
            <Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>{decodeURIComponent(message)}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2.5 p-3 text-sm text-red-800 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-lg">
              <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="password" className="text-teal-950 dark:text-neutral-300 font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="border-neutral-200 dark:border-neutral-800 focus:border-teal-500 focus:ring-teal-500/20 rounded-lg"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-2 rounded-lg transition-all shadow-md shadow-teal-600/10 hover:shadow-lg hover:shadow-teal-600/20 mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/60">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          New to Bokra Stay?{" "}
          <Link href="/register" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}


