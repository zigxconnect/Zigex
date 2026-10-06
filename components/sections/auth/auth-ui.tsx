"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared building blocks for every auth page, so sign-in, sign-up, verify,
 * forgot and reset all use the same label, input, button and message styles.
 *
 * Standard: 48px inputs and buttons, 12px radius, 14px medium labels above
 * the field (never placeholders as labels), hints and errors below it, errors
 * linked with aria-describedby, one blue focus ring.
 */

export const inputClass =
  "h-12 w-full rounded-xl border border-[#DCE5F5] bg-white px-4 text-[15px] text-[#0B1B3F] placeholder:text-[#9AA4B8] " +
  "transition-[border-color,box-shadow] hover:border-[#B9C8E6] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15 " +
  "disabled:cursor-not-allowed disabled:bg-[#F8FAFF] disabled:text-[#7B869C] " +
  "aria-[invalid=true]:border-[#D92D20] aria-[invalid=true]:focus:ring-[#D92D20]/15";

/** Page heading block for the form column. */
export function AuthHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">{title}</h1>
      {description && <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]">{description}</p>}
    </div>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Right side of the label row, e.g. "Forgot password?". */
  aside?: ReactNode;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

/** Label above, control, then hint or error below — wired up for screen readers. */
export function Field({ label, error, hint, aside, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-[#0B1B3F]">
          {label}
        </label>
        {aside}
      </div>
      {children({ id, describedBy: error || hint ? messageId : undefined, invalid: Boolean(error) })}
      {error ? (
        <p id={messageId} className="mt-1.5 flex items-start gap-1.5 text-[13px] text-[#B42318]">
          <AlertCircle className="mt-px h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={messageId} className="mt-1.5 text-[13px] text-[#4A5670]">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Password input with a show/hide toggle inside the field. */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordInput(
  { className, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={visible ? "text" : "password"} className={cn(inputClass, "pr-12", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#7B869C] hover:bg-[#F3F7FF] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
      </button>
    </div>
  );
});

/** Full-width primary action; shows a spinner and its busy label while working. */
export function SubmitButton({
  children,
  busy,
  busyLabel,
  disabled,
}: {
  children: ReactNode;
  busy?: boolean;
  busyLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      aria-busy={busy}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-6 text-base font-semibold text-white shadow-sm shadow-[#155DFC]/25 transition-[background-color,transform] hover:bg-[#0F3FB8] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
      {busy ? busyLabel ?? children : children}
    </button>
  );
}

/** Inline message for the whole form (errors from the server, confirmations). */
export function FormAlert({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  const styles = {
    error: "bg-[#FEF3F2] text-[#B42318] ring-[#FECDCA]",
    success: "bg-[#ECFDF3] text-[#067647] ring-[#ABEFC6]",
    info: "bg-[#F3F7FF] text-[#0B1B3F] ring-[#DCE5F5]",
  }[tone];
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ring-1", styles)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

/** "or" separator between Google and email sign-in. */
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-[#7B869C]" role="separator">
      <span className="h-px flex-1 bg-[#DCE5F5]" />
      or
      <span className="h-px flex-1 bg-[#DCE5F5]" />
    </div>
  );
}

/** Secondary line under the form, e.g. "New to Zigex? Create an account". */
export function AuthFooter({ children }: { children: ReactNode }) {
  return <p className="mt-8 text-[15px] text-[#4A5670]">{children}</p>;
}

export const authLink =
  "font-semibold text-[#155DFC] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] rounded-sm";
