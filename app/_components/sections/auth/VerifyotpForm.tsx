"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/_components/ui/Button";
import { Input } from "@/app/_components/ui/Input";
import { Spinner } from "@/app/_components/ui/Spinner";
import { KeyRound } from "lucide-react";

const formSchema = z.object({
  token: z.string().length(6, { message: "Your code must be 6 digits." }),
});
type FormData = z.infer<typeof formSchema>;

export const VerifyOtpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { token: "" },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Verifying OTP:", data.token, "for email:", email);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/admin/postings");
  };

  if (!email) {
    return (
      <div className="text-center text-red-500">
        <p>Error: Email not found in URL.</p>
        <p>
          Please{" "}
          <a href="/sign-in" className="underline">
            try signing in again
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a 6-digit verification code to{" "}
          <span className="font-semibold text-gray-800">{email}</span>. Please
          enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <Input
            placeholder="123456"
            {...register("token")}
            disabled={isSubmitting}
            className="mt-1 tracking-[1em] text-center"
          />
          {errors.token && (
            <p className="text-xs text-red-500 mt-1">{errors.token.message}</p>
          )}
        </div>
        <Button
          variant="orange"
          type="submit"
          className="w-full !mt-6 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Spinner /> Verifying...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>
      </form>
    </div>
  );
};
