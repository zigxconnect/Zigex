"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { api } from "@/lib/api/browser-client";
import { ApiClientError, isEndpointMissing } from "@/lib/api/errors";
import { PasswordInput } from "@/components/sections/auth/auth-ui";

const SUPPORT_EMAIL = "zigexconnect.com@gmail.com";
/** Agreed in docs/backend-request-push-and-delete-account.md; change here if the backend picks another path. */
const DELETE_PATH = "/students/me";

const WHAT_GOES = [
  "Your profile, photo and uploaded documents",
  "Your applications and their history",
  "Your sign-in, so this email can be used to sign up again",
];

/**
 * Delete account: a red button that opens a confirmation. Asks for the
 * password and for "DELETE" typed out, says plainly what is removed, and
 * signs the student out afterwards. Until the backend endpoint exists, it
 * explains that and offers the email route instead.
 */
export function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const ready = password.length > 0 && confirmText.trim().toUpperCase() === "DELETE";

  const reset = () => {
    setPassword("");
    setConfirmText("");
    setError(null);
  };

  const remove = async () => {
    if (!ready) return;
    setBusy(true);
    setError(null);
    try {
      await api.delete(DELETE_PATH, { body: { password } });
      // The account is gone: end the session here too, then leave.
      await api.post("/auth/logout").catch(() => {});
      window.location.href = "/?account=deleted";
    } catch (err) {
      if (isEndpointMissing(err)) {
        setUnavailable(true);
        return;
      }
      const status = err instanceof ApiClientError ? err.status : 0;
      setError(
        status === 401 || status === 400
          ? "That password isn't right. Your account was not deleted."
          : status === 429
            ? "Too many tries. Wait a few minutes, then try again."
            : "Your account wasn't deleted. Check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Delete my Zigex account")}&body=${encodeURIComponent(
    `Please delete the Zigex account for ${email}.`
  )}`;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (busy) return;
        setOpen(o);
        if (!o) reset();
      }}
    >
      <Dialog.Trigger className="inline-flex h-11 items-center rounded-xl px-1 text-[15px] font-semibold text-[#B42318] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20]">
        Delete account
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-[#0B1B3F]/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-4 top-1/2 z-[101] mx-auto max-h-[90dvh] max-w-md -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_24px_64px_-16px_rgba(11,27,63,0.4)] focus:outline-none"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF3F2]">
              <AlertTriangle className="h-5 w-5 text-[#D92D20]" aria-hidden="true" />
            </span>
            <Dialog.Close disabled={busy} aria-label="Close" className="-mr-2 -mt-2 flex h-10 w-10 items-center justify-center rounded-lg text-[#4A5670] hover:bg-[#F3F7FF]">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          {unavailable ? (
            <>
              <Dialog.Title className="mt-4 font-heading text-xl font-semibold text-[#0B1B3F]">Delete it by email for now</Dialog.Title>
              <p className="mt-2 text-base leading-relaxed text-[#4A5670]">
                Deleting your account from this page isn&apos;t available yet. Email us from <span className="font-medium text-[#0B1B3F]">{email}</span> and
                we&apos;ll delete it for you after confirming it&apos;s you.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                <a href={mailto} className="inline-flex h-11 items-center sm:flex-1 justify-center rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8]">
                  Email support
                </a>
                <Dialog.Close className="inline-flex h-11 items-center sm:flex-1 justify-center rounded-xl px-5 text-[15px] font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF]">
                  Keep my account
                </Dialog.Close>
              </div>
            </>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                remove();
              }}
            >
              <Dialog.Title className="mt-4 font-heading text-xl font-semibold text-[#0B1B3F]">Delete your account?</Dialog.Title>
              <p className="mt-2 text-base text-[#4A5670]">This can&apos;t be undone. We&apos;ll permanently remove:</p>
              <ul className="mt-3 space-y-1.5 text-sm text-[#0B1B3F]">
                {WHAT_GOES.map((w) => (
                  <li key={w} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D92D20]" aria-hidden="true" />
                    {w}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-[#4A5670]">
                Want a break instead? You can simply sign out; your profile stays as it is.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="del-password" className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                    Your password
                  </label>
                  <PasswordInput id="del-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="del-confirm" className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
                    Type DELETE to confirm
                  </label>
                  <input
                    id="del-confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="h-12 w-full rounded-xl border border-[#DCE5F5] bg-white px-4 text-base uppercase tracking-wide text-[#0B1B3F] focus:border-[#D92D20] focus:outline-none focus:ring-4 focus:ring-[#D92D20]/15"
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-xl bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={!ready || busy}
                  className="inline-flex h-11 items-center sm:flex-1 justify-center gap-2 rounded-xl bg-[#D92D20] px-5 text-[15px] font-semibold text-white hover:bg-[#B42318] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {busy ? "Deleting…" : "Delete my account"}
                </button>
                <Dialog.Close
                  type="button"
                  disabled={busy}
                  className="inline-flex h-11 items-center sm:flex-1 justify-center rounded-xl px-5 text-[15px] font-semibold text-[#0B1B3F] hover:bg-[#F3F7FF]"
                >
                  Keep my account
                </Dialog.Close>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
