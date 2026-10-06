"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api/browser-client";
import { ApiClientError, isEndpointMissing } from "@/lib/api/errors";
import { OtpInput } from "./OtpInput";
import {
  AuthFooter,
  AuthHeader,
  Field,
  FormAlert,
  PasswordStrength,
  PasswordInput,
  SubmitButton,
  authLink,
  emailInputProps,
  inputClass,
  passwordStrength,
  useAuthNext,
} from "./auth-ui";
import { getReturnUrl } from "@/lib/utils/redirect";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

const schema = z.object({
  email: z.string().trim().email({ message: "Enter the email you asked for the code with." }),
  otp: z.string().length(OTP_LENGTH, { message: `Enter all ${OTP_LENGTH} digits from the email.` }),
  password: z
    .string()
    .min(8, { message: "Use at least 8 characters." })
    .refine((p) => passwordStrength(p).level >= 2, { message: "Too weak. Mix in numbers or capital letters." }),
});
type FormData = z.infer<typeof schema>;

/** Step 2 of the reset: POST /auth/reset-password with the emailed code. */
export const ResetPasswordForm = () => {
  const params = useSearchParams();
  const emailFromLink = params.get("email") ?? "";
  const { href } = useAuthNext();
  const codeLabelId = useId();
  const codeErrorId = useId();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    params.get("sent") === "1" && emailFromLink
      ? `If ${emailFromLink} has a Zigex account, a 6-digit code is on its way.`
      : null
  );
  const [countdown, setCountdown] = useState(params.get("sent") === "1" ? RESEND_COOLDOWN_SECONDS : 0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: emailFromLink, otp: "", password: "" },
  });
  const password = useWatch({ control, name: "password" }) ?? "";

  const onSubmit = async ({ email, otp, password: newPassword }: FormData) => {
    setError(null);
    setNotice(null);
    try {
      const res = await api.post<{ user?: unknown }>("/auth/reset-password", { email, otp, newPassword });
      // The passthrough stores the returned token, so the student is signed in.
      window.location.href = res.data?.user ? getReturnUrl("/feed") : href("/sign-in", { reset: "1", email });
    } catch (err) {
      setError(
        isEndpointMissing(err)
          ? "Password reset isn't available yet. Email zigexconnect.com@gmail.com for help."
          : err instanceof ApiClientError && err.status === 400
            ? "That code is wrong or has expired. Check the latest email, or send a new code."
            : "We couldn't reset your password. Check your connection and try again."
      );
    }
  };

  const resend = async () => {
    const email = getValues("email").trim();
    if (!z.string().email().safeParse(email).success) {
      setError("Enter your email above first, then send a new code.");
      return;
    }
    setResending(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email });
      setNotice(`If ${email} has a Zigex account, a new code is on its way.`);
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch {
      setError("We couldn't send a new code. Try again in a moment.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <AuthHeader
        title="Set a new password"
        description="Enter the 6-digit code from the email, then choose a new password."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <FormAlert tone="error">{error}</FormAlert>}
        {notice && !error && <FormAlert tone="success">{notice}</FormAlert>}

        <Field label="Email" error={errors.email?.message}>
          {({ id, describedBy, invalid }) => (
            <input
              id={id}
              {...emailInputProps}
              autoFocus={!emailFromLink}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className={inputClass}
              {...register("email")}
            />
          )}
        </Field>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <p id={codeLabelId} className="text-sm font-medium text-[#0B1B3F]">
              Reset code
            </p>
            {countdown > 0 ? (
              <span className="text-sm text-[#7B869C]">New code in {countdown}s</span>
            ) : (
              <button type="button" onClick={resend} disabled={resending} className={`${authLink} text-sm disabled:opacity-60`}>
                {resending ? "Sending…" : "Send a new code"}
              </button>
            )}
          </div>
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <OtpInput
                length={OTP_LENGTH}
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                invalid={Boolean(errors.otp)}
                autoFocus={Boolean(emailFromLink)}
                labelledBy={codeLabelId}
                describedBy={errors.otp ? codeErrorId : undefined}
              />
            )}
          />
          {errors.otp && (
            <p id={codeErrorId} className="mt-2 text-[13px] text-[#B42318]">
              {errors.otp.message}
            </p>
          )}
        </div>

        <Field label="New password" error={errors.password?.message}>
          {({ id, describedBy, invalid }) => (
            <>
              <PasswordInput
                id={id}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                {...register("password")}
              />
              {!invalid && <PasswordStrength password={password} />}
            </>
          )}
        </Field>

        <SubmitButton busy={isSubmitting} busyLabel="Saving…">
          Save new password
        </SubmitButton>
      </form>

      <AuthFooter>
        <Link href={href("/sign-in", { email: emailFromLink || undefined })} className={`${authLink} inline-flex items-center gap-1.5`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </AuthFooter>
    </>
  );
};
