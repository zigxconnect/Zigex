"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api/browser-client";
import { ApiClientError, isEndpointMissing } from "@/lib/api/errors";
import { AuthFooter, AuthHeader, Field, FormAlert, SubmitButton, authLink, inputClass } from "./auth-ui";

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address, like name@example.com." }),
});
type FormData = z.infer<typeof schema>;

/** Step 1 of the reset: POST /auth/forgot-password emails a 6-digit code. */
export const ForgotPasswordForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    setError(null);
    try {
      // Succeeds for unknown emails too, so nobody can probe for accounts.
      await api.post("/auth/forgot-password", { email });
      router.push(`/reset-password?email=${encodeURIComponent(email)}&sent=1`);
    } catch (err) {
      setError(
        isEndpointMissing(err)
          ? "Password reset isn't available yet. Email zigexconnect.com@gmail.com for help."
          : err instanceof ApiClientError && err.status === 429
            ? "You've asked for several codes. Wait a few minutes before asking again."
            : "We couldn't send the code. Check your connection and try again."
      );
    }
  };

  return (
    <>
      <AuthHeader
        title="Reset your password"
        description="Enter the email you signed up with. We'll send you a 6-digit code to set a new password."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <Field label="Email" error={errors.email?.message}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="name@example.com"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={inputClass}
              {...register("email")}
            />
          )}
        </Field>
        <SubmitButton busy={isSubmitting} busyLabel="Sending code…">
          Send reset code
        </SubmitButton>
      </form>

      <AuthFooter>
        <Link href="/sign-in" className={`${authLink} inline-flex items-center gap-1.5`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </AuthFooter>
    </>
  );
};
