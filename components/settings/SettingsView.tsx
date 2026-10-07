"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, LogOut } from "lucide-react";
import { api } from "@/lib/api/browser-client";
import { ApiClientError } from "@/lib/api/errors";
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from "@/lib/actions/push.actions";
import { PasswordInput, PasswordStrength, passwordStrength } from "@/components/sections/auth/auth-ui";
import { DeleteAccount } from "./DeleteAccount";

function Row({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:p-8">
      <div>
        <h2 id={`${id}-title`} className="font-heading text-base font-semibold text-[#0B1B3F]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#4A5670]">{note}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Notice({ tone, children }: { tone: "ok" | "error" | "info"; children: React.ReactNode }) {
  const style = { ok: "bg-[#ECFDF3] text-[#067647]", error: "bg-[#FEF3F2] text-[#B42318]", info: "bg-[#F3F7FF] text-[#0B1B3F]" }[tone];
  const Icon = tone === "ok" ? CheckCircle2 : AlertCircle;
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${style}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/**
 * Account settings only. Profile details (name, school, skills, links) live in
 * Edit profile, so they're linked here instead of repeated.
 */
export function SettingsView({ email, profileHref }: { email: string; profileHref: string | null }) {
  return (
    <div className="pb-16">
      <header className="mb-6">
        <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Settings</h1>
        <p className="mt-1 text-base text-[#4A5670]">Your account, password and notifications.</p>
      </header>

      <div className="divide-y divide-[#EEF2FA] rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
        <Row id="account" title="Account" note="How you sign in, and where your profile details live.">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[#7B869C]">Sign-in email</dt>
              <dd className="mt-0.5 font-medium text-[#0B1B3F]">{email || "Not available"}</dd>
            </div>
            <div>
              <dt className="text-[#7B869C]">Name, school, skills and links</dt>
              <dd className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                <Link href="/dashboard/edit-profile" className="font-semibold text-[#155DFC] hover:underline">
                  Edit profile
                </Link>
                {profileHref && (
                  <Link href={profileHref} className="font-semibold text-[#155DFC] hover:underline">
                    View public profile
                  </Link>
                )}
              </dd>
            </div>
          </dl>
        </Row>

        <Row id="password" title="Password" note="Use one you don't use on other sites.">
          <ChangePassword />
        </Row>

        <Row id="notifications" title="Notifications" note="Get told when a company replies or an opportunity you follow changes.">
          <DeviceNotifications />
          <p className="mt-4 text-sm text-[#4A5670]">Zigex also emails you about your applications. Those emails can&apos;t be turned off yet.</p>
        </Row>

        <Row id="privacy" title="Privacy" note="What other people see when they open your profile.">
          <ul className="space-y-2 text-sm text-[#0B1B3F]">
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
              Shown: your name, photo, school, course, intro, skills, experience and links.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
              Only companies you apply to see your phone number.
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" aria-hidden="true" />
              Never shown on your profile: your email, date of birth, GPA and the support you asked for.
            </li>
          </ul>
        </Row>

        <Row id="session" title="Sign out and account" note="Sign out on this device, or delete your account.">
          <SignOut />
          <div className="mt-6 border-t border-[#EEF2FA] pt-5">
            <p className="text-sm text-[#4A5670]">Deleting your account removes your profile, applications and documents for good.</p>
            <DeleteAccount email={email} />
          </div>
        </Row>
      </div>
    </div>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const strong = passwordStrength(next).level >= 2;
  const mismatch = confirm.length > 0 && confirm !== next;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    if (!current) return setResult({ tone: "error", text: "Enter your current password." });
    if (!strong) return setResult({ tone: "error", text: "Choose a stronger new password (8+ characters, mixing letters and numbers)." });
    if (next !== confirm) return setResult({ tone: "error", text: "The two new passwords don't match." });
    if (next === current) return setResult({ tone: "error", text: "The new password is the same as the current one." });
    setBusy(true);
    try {
      await api.patch("/auth/password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      setResult({ tone: "ok", text: "Password changed. Use the new one next time you sign in." });
    } catch (err) {
      const status = err instanceof ApiClientError ? err.status : 0;
      setResult({
        tone: "error",
        text:
          status === 400 || status === 401
            ? "Your current password isn't right. Check it and try again."
            : status === 429
              ? "Too many tries. Wait a few minutes, then try again."
              : "Your password wasn't changed. Check your connection and try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const label = "mb-1.5 block text-sm font-medium text-[#0B1B3F]";
  return (
    <form onSubmit={submit} noValidate className="max-w-md space-y-4">
      <div>
        <label htmlFor="pw-current" className={label}>
          Current password
        </label>
        <PasswordInput id="pw-current" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div>
        <label htmlFor="pw-new" className={label}>
          New password
        </label>
        <PasswordInput id="pw-new" autoComplete="new-password" placeholder="At least 8 characters" value={next} onChange={(e) => setNext(e.target.value)} />
        <PasswordStrength password={next} />
      </div>
      <div>
        <label htmlFor="pw-confirm" className={label}>
          Confirm new password
        </label>
        <PasswordInput id="pw-confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-invalid={mismatch} />
        {mismatch && <p className="mt-1.5 text-sm text-[#B42318]">Doesn&apos;t match the new password yet.</p>}
      </div>
      {result && <Notice tone={result.tone}>{result.text}</Notice>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8] disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {busy ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = window.atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** Push notifications on this device: asked for only when the student turns them on. */
function DeviceNotifications() {
  const [state, setState] = useState<"checking" | "unsupported" | "unavailable" | "blocked" | "on" | "off">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setState("unsupported");
      // Push needs the site's public key; without it, it's Zigex that isn't ready, not the browser.
      if (!key) return setState("unavailable");
      if (Notification.permission === "denied") return setState("blocked");
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, [key]);

  const turnOn = async () => {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register(process.env.NODE_ENV === "production" ? "/sw.js" : "/push-sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key!) });
      const res = await subscribeToPushNotifications(sub.toJSON(), window.location.origin);
      if (!res.success) {
        await sub.unsubscribe();
        throw new Error(res.pending ? "Notifications aren't available on Zigex yet." : "Notifications couldn't be turned on. Try again.");
      }
      setState("on");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Notifications couldn't be turned on. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await unsubscribeFromPushNotifications(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setError("Notifications couldn't be turned off. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "checking") return <p className="text-sm text-[#7B869C]">Checking this device…</p>;
  if (state === "unavailable") return <Notice tone="info">Notifications on your phone or computer are coming soon. Until then, Zigex emails you about your applications.</Notice>;
  if (state === "unsupported") return <Notice tone="info">This browser doesn&apos;t support notifications. Try Chrome or Edge, or add Zigex to your phone&apos;s home screen.</Notice>;
  if (state === "blocked")
    return (
      <Notice tone="info">
        Notifications are blocked for Zigex in this browser. To allow them, tap the lock icon next to the address bar, open
        site settings, set Notifications to Allow, then reload this page.
      </Notice>
    );

  return (
    <div>
      <label htmlFor="push-switch" className="flex max-w-md cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 ring-1 ring-[#DCE5F5]">
        <span>
          <span className="block text-sm font-medium text-[#0B1B3F]">Notifications on this device</span>
          <span className="block text-sm text-[#4A5670]">{state === "on" ? "On. You'll get alerts even when Zigex is closed." : "Off"}</span>
        </span>
        <span className="flex items-center gap-2">
          {busy && <Loader2 className="h-4 w-4 animate-spin text-[#7B869C]" aria-hidden="true" />}
          <SwitchPrimitive.Root
            id="push-switch"
            checked={state === "on"}
            disabled={busy}
            onCheckedChange={(on) => (on ? turnOn() : turnOff())}
            className="relative h-6 w-10 shrink-0 rounded-full bg-[#CBD5E6] transition-colors data-[state=checked]:bg-[#155DFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2 disabled:opacity-60"
          >
            <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[18px]" />
          </SwitchPrimitive.Root>
        </span>
      </label>
      {error && (
        <div className="mt-3 max-w-md">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
    </div>
  );
}

function SignOut() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await api.post("/auth/logout").catch(() => {});
        window.location.href = "/";
      }}
      className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE5F5] bg-white px-5 text-[15px] font-semibold text-[#B42318] hover:bg-[#FEF3F2] disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
      Sign out
    </button>
  );
}
