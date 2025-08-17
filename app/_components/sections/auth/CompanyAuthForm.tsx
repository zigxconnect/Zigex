"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/app/_components/ui/Button"; // Use your custom Button
import { Input } from "@/app/_components/ui/Input"; // Use your custom Input
import { Spinner } from "@/app/_components/ui/Spinner";
import { Building } from "lucide-react";

// Validation schema for the company registration form
const formSchema = z.object({
  companyName: z.string().min(2, { message: "Company name is required." }),
  email: z.string().email({ message: "Please enter a valid work email." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});
type FormData = z.infer<typeof formSchema>;

export const CompanyAuthForm = () => {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { companyName: "", email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setApiError(null);
    // This is where you will call your `/api/auth/register-company` route
    console.log("Submitting company data:", data);

    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // On success, redirect to the main sign-in page
    alert("Registration successful! Please proceed to the sign-in page.");
    router.push("/sign-in");
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
          <Building className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Create a Company Account
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Start finding the best talent today.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Company Name
          </label>
          <Input
            placeholder="Your Company Inc."
            {...register("companyName")}
            disabled={isSubmitting}
            className="mt-1"
          />
          {errors.companyName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.companyName.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Work Email
          </label>
          <Input
            type="email"
            placeholder="you@company.com"
            {...register("email")}
            disabled={isSubmitting}
            className="mt-1"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Input
            type="password"
            placeholder="Create a strong password"
            {...register("password")}
            disabled={isSubmitting}
            className="mt-1"
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {apiError && (
          <p className="text-sm text-red-500 text-center">{apiError}</p>
        )}

        <Button
          variant="orange"
          type="submit"
          className="w-full !mt-6 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner /> Registering...
            </>
          ) : (
            "Create Company Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-orange-500 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};
