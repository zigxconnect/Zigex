"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/uiComponent/Spinner";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[A-Z]/, { message: "Must include an uppercase letter." })
      .regex(/[0-9]/, { message: "Must include a number." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof updatePasswordSchema>;

const StrengthMeter = ({ password = "" }: { password?: string }) => {
  const checks = [
    { label: "8+ chars", met: password.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter((c) => c.met).length;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              i <= score
                ? score <= 2
                  ? "bg-destructive/70"
                  : score === 3
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((check, i) => (
          <span
            key={i}
            className={cn(
              "text-[10px] flex items-center gap-1 transition-colors",
              check.met ? "text-emerald-600 font-medium" : "text-muted-foreground"
            )}
          >
            <div
              className={cn(
                "w-1 h-1 rounded-full",
                check.met ? "bg-emerald-500" : "bg-muted-foreground/30"
              )}
            />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const UpdatePasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [hasVerificationFailed, setHasVerificationFailed] = useState(false);
  const [formState, setFormState] = useState<"idle" | "success">("idle");
  const [showPassword, setShowPassword] = useState(false);
  const [supabase] = useState(() => createClient());

  const verificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const passwordValue = useWatch({ control: form.control, name: "password" }) || "";

  useEffect(() => {
    // Check for errors passed from the callback route
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (errorParam) {
      console.error("[UpdatePasswordForm] Auth Error:", errorParam, errorDescription);
      setApiError(
        errorDescription?.replace(/\+/g, " ") || "The reset link is invalid or has expired."
      );
      setHasVerificationFailed(true);
      return;
    }

    // Safety timeout: If we don't have a session after 8 seconds, something is wrong
    verificationTimeoutRef.current = setTimeout(() => {
      if (!isSessionReady) {
        setHasVerificationFailed(true);
        setApiError(
          "Authentication session could not be established. Please try requesting a new link."
        );
      }
    }, 8000);

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsSessionReady(true);
        if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsSessionReady(true);
          if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      if (verificationTimeoutRef.current) clearTimeout(verificationTimeoutRef.current);
    };
  }, [supabase, searchParams, isSessionReady]);

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;

      setFormState("success");
      toast.success("Security updated successfully");

      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: any) {
      setApiError(err.message || "Failed to update password.");
      toast.error(err.message);
    }
  };

  return (
    <div className="w-full max-w-[440px] mx-auto py-12 px-6">
      <AnimatePresence mode="wait">
        {hasVerificationFailed ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-destructive/20 shadow-lg">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                  Access Denied
                </CardTitle>
                <CardDescription className="text-sm px-2 mt-2">
                  {apiError ||
                    "This link is no longer valid or the session has expired for security reasons."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-4">
                <Button
                  onClick={() => router.push("/forgot-password")}
                  variant="destructive"
                  className="w-full h-11 rounded-xl shadow-sm font-semibold"
                >
                  Request New Link
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : !isSessionReady ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Spinner className="h-10 w-10 text-primary" />
            <p className="mt-6 text-muted-foreground font-medium animate-pulse tracking-tight text-[15px]">
              Establishing secure connection...
            </p>
          </motion.div>
        ) : formState === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-emerald-100 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <CardHeader className="text-center pt-10 pb-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Identity Secured
                </CardTitle>
                <CardDescription className="text-[15px] pt-2">
                  Your password has been changed. <br /> Taking you to your dashboard now.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-2xl border-border/40 overflow-hidden bg-card relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <CardHeader className="space-y-1 pb-6 pt-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <LockKeyhole size={24} />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  New Password
                </CardTitle>
                <CardDescription className="text-[15px]">
                  Update your credentials to secure your account.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[13px] font-bold uppercase tracking-wider text-foreground/70 ml-1">
                            New Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={cn(
                                  "h-12 px-4 rounded-xl border-input/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/30",
                                  form.formState.errors.password &&
                                  "border-destructive focus:border-destructive focus:ring-destructive/10"
                                )}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                              >
                                {showPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <StrengthMeter password={passwordValue} />
                          <FormMessage className="text-[11px] font-medium ml-1" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[13px] font-bold uppercase tracking-wider text-foreground/70 ml-1">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className={cn(
                                "h-12 px-4 rounded-xl border-input/60 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/30",
                                form.formState.errors.confirmPassword &&
                                "border-destructive focus:border-destructive focus:ring-destructive/10"
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[11px] font-medium ml-1" />
                        </FormItem>
                      )}
                    />

                    <div className="pt-3">
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md shadow-primary/20 disabled:opacity-70 disabled:shadow-none text-base"
                      >
                        {form.formState.isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <Spinner className="h-4 w-4 text-primary-foreground" />
                            <span>Securing Account...</span>
                          </div>
                        ) : (
                          "Update Security"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="flex flex-col border-t border-border/50 bg-muted/30 pt-6 pb-6 mt-4">
                <button
                  onClick={() => router.push("/sign-in")}
                  className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Return to Login
                </button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
