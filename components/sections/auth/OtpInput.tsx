"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type OtpInputProps = {
  length: number;
  value: string;
  onChange: (code: string) => void;
  /** Called once every box is filled (used to submit automatically). */
  onComplete?: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  /** id of the error/hint text, for screen readers. */
  describedBy?: string;
  /** id of the visible label for the group. */
  labelledBy?: string;
};

/**
 * Segmented code input: one box per digit, auto-advance, backspace goes back,
 * arrow keys move, and pasting the whole code (or the phone's one-time-code
 * autofill) fills every box.
 */
export function OtpInput({ length, value, onChange, onComplete, disabled, invalid, describedBy, labelledBy }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const commit = (next: string) => {
    const code = next.replace(/\D/g, "").slice(0, length);
    onChange(code);
    if (code.length === length) onComplete?.(code);
    return code;
  };

  const handleInput = (index: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // Autofill or a fast typist can put several digits in one box.
    const code = commit(value.slice(0, index) + typed + value.slice(index + typed.length));
    refs.current[Math.min(code.length, length - 1)]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        commit(value.slice(0, index - 1) + value.slice(index));
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const code = commit(e.clipboardData.getData("text"));
    refs.current[Math.min(code.length, length - 1)]?.focus();
  };

  return (
    <div role="group" aria-labelledby={labelledBy} aria-describedby={describedBy} className="flex gap-2 sm:gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? length : 1}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={invalid}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "h-14 w-full min-w-0 rounded-xl border bg-white text-center font-heading text-2xl font-semibold text-[#0B1B3F] tabular-nums",
            "transition-[border-color,box-shadow] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15 disabled:bg-[#F8FAFF]",
            invalid ? "border-[#D92D20]" : digit ? "border-[#B9C8E6]" : "border-[#DCE5F5]"
          )}
        />
      ))}
    </div>
  );
}
