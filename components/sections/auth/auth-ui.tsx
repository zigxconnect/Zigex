"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Check, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeRedirectUrl } from "@/lib/utils/redirect";

/**
 * Shared building blocks for every auth page, so sign-in, sign-up, verify,
 * forgot and reset all use the same label, input, button and message styles.
 *
 * Standard: 48px inputs and buttons, 12px radius, 14px medium labels above
 * the field (never placeholders as labels), hints and errors below it, errors
 * linked with aria-describedby, one blue focus ring.
 */

export const inputClass =
  "h-12 w-full rounded-xl border border-[#DCE5F5] bg-white px-4 text-[15px] text-[#0B1B3F] placeholder:text-[#7B869C] " +
  "transition-[border-color,box-shadow] hover:border-[#B9C8E6] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15 " +
  "disabled:cursor-not-allowed disabled:bg-[#F8FAFF] disabled:text-[#7B869C] " +
  "aria-[invalid=true]:border-[#D92D20] aria-[invalid=true]:focus:ring-[#D92D20]/15";

/** Page heading block for the form column. */
export function AuthHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-6">
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

/** Password input with a show/hide toggle and a Caps Lock warning. */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordInput(
  { className, onKeyDown, onKeyUp, onBlur, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const checkCaps = (e: KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.("CapsLock") ?? false);

  return (
    <>
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(inputClass, "pr-12", className)}
          onKeyDown={(e) => {
            checkCaps(e);
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            checkCaps(e);
            onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setCapsLock(false);
            onBlur?.(e);
          }}
          {...props}
        />
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
      {capsLock && (
        <p role="status" className="mt-1.5 text-[13px] font-medium text-[#B54708]">
          Caps Lock is on.
        </p>
      )}
    </>
  );
});

const STRENGTH = [
  { label: "", color: "", text: "" },
  { label: "Weak", color: "bg-[#D92D20]", text: "text-[#B42318]" },
  { label: "Strong", color: "bg-[#155DFC]", text: "text-[#155DFC]" },
  { label: "Stronger", color: "bg-[#12B76A]", text: "text-[#067647]" },
] as const;

/** 0 = empty, 1 = weak, 2 = strong, 3 = stronger, plus a tip to move up a level. */
export function passwordStrength(password: string): { level: 0 | 1 | 2 | 3; tip: string } {
  if (!password) return { level: 0, tip: "Use 8 or more characters." };
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (password.length < 8) return { level: 1, tip: `${8 - password.length} more character${password.length === 7 ? "" : "s"} needed.` };
  if (password.length >= 14 || (password.length >= 10 && kinds >= 3)) return { level: 3, tip: "Great password." };
  if (kinds >= 2) return { level: 2, tip: password.length >= 10 ? "Add a symbol to make it stronger." : "Make it 10+ characters to make it stronger." };
  return { level: 1, tip: "Mix in numbers or capital letters." };
}

/** Three-segment strength bar under a new password: weak, strong, stronger. */
export function PasswordStrength({ password }: { password: string }) {
  const { level, tip } = passwordStrength(password);
  const current = STRENGTH[level];
  return (
    <div className="mt-2">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= level ? current.color : "bg-[#E3E9F5]"}`}
          />
        ))}
      </div>
      <p className="mt-1.5 flex justify-between gap-3 text-[13px]" aria-live="polite">
        <span className="text-[#4A5670]">{tip}</span>
        {level > 0 && <span className={`shrink-0 font-semibold ${current.text}`}>{current.label}</span>}
      </p>
    </div>
  );
}

/** Attributes every email input shares: right keyboard, no auto-capitalising or spell-check. */
export const emailInputProps = {
  type: "email",
  inputMode: "email",
  autoComplete: "email",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
  placeholder: "you@example.com",
} as const;

// Common misspellings of the email providers students in Cameroon use most.
const DOMAIN_FIXES: Record<string, string> = {
  "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.con": "gmail.com", "gmaill.com": "gmail.com", "gmai.com": "gmail.com",
  "yahooo.com": "yahoo.com", "yaho.com": "yahoo.com", "yahoo.co": "yahoo.com", "yahoo.cm": "yahoo.com",
  "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com", "outllok.com": "outlook.com", "outlook.co": "outlook.com",
  "icloud.co": "icloud.com", "iclod.com": "icloud.com",
};

/** "amina@gmial.com" → "amina@gmail.com"; null when nothing looks wrong. */
export function suggestEmail(email: string): string | null {
  const [user, domain] = email.trim().toLowerCase().split("@");
  if (!user || !domain) return null;
  const fixed = DOMAIN_FIXES[domain];
  return fixed ? `${user}@${fixed}` : null;
}

/** "Did you mean …?" under an email field; one tap applies the fix. */
export function EmailSuggestion({ value, onAccept }: { value: string; onAccept: (email: string) => void }) {
  const suggestion = suggestEmail(value ?? "");
  if (!suggestion) return null;
  return (
    <p className="mt-1.5 text-[13px] text-[#4A5670]">
      Did you mean{" "}
      <button type="button" onClick={() => onAccept(suggestion)} className={`${authLink} font-semibold`}>
        {suggestion}
      </button>
      ?
    </p>
  );
}

/**
 * Where to send the student after auth. Every auth link and redirect carries
 * it, so "Apply" → sign up → verify ends back on the same opportunity.
 */
export function useAuthNext() {
  const params = useSearchParams();
  const raw = params.get("next");
  const next = raw ? sanitizeRedirectUrl(raw, "") || null : null;
  return {
    next,
    /** True when they came from an opportunity's Apply button. */
    applying: Boolean(next?.startsWith("/feed/")),
    /** Build an auth link that keeps `next` (and any extra params). */
    href: (path: string, extra: Record<string, string | undefined> = {}) => {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
      if (next) q.set("next", next);
      const qs = q.toString();
      return qs ? `${path}?${qs}` : path;
    },
  };
}

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
    <div className="my-4 flex items-center gap-4 text-sm text-[#7B869C]" role="separator">
      <span className="h-px flex-1 bg-[#DCE5F5]" />
      or
      <span className="h-px flex-1 bg-[#DCE5F5]" />
    </div>
  );
}

/** Secondary line under the form, e.g. "New to Zigex? Create an account". */
export function AuthFooter({ children }: { children: ReactNode }) {
  return <p className="mt-6 text-[15px] text-[#4A5670]">{children}</p>;
}

export const authLink =
  "font-semibold text-[#155DFC] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] rounded-sm";
