import { NextResponse } from "next/server";

/**
 * Liveness check for deploys and uptime monitors: answers without touching
 * the backend, so a slow API doesn't make a healthy release look broken.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { status: "ok", version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
