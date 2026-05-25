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

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["RENTER", "HOST"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "RENTER",
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    setError("");
    const result = await registerUser(data);
    
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-3 pt-2 border-t mt-4">
              <Label>I want to use Bokra Stay to...</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button" 
                  variant={selectedRole === "RENTER" ? "default" : "outline"} 
                  onClick={() => setValue("role", "RENTER")}
                  className="w-full"
                >
                  Book places
                </Button>
                <Button 
                  type="button" 
                  variant={selectedRole === "HOST" ? "default" : "outline"} 
                  onClick={() => setValue("role", "HOST")}
                  className="w-full"
                >
                  Host guests
                </Button>
              </div>
              {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
            </div>
            
            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
