import { NextResponse } from "next/server";

/**
 * The public half of the push key pair, for the service worker
 * (public/push-sw.js), which can't read build settings. When a browser drops
 * or replaces a subscription, the worker subscribes again with this key on its
 * own, without the student opening Zigex. Public by design: it's in the app too.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  return NextResponse.json({ key }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
