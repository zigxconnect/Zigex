import { NextResponse } from "next/server";

// This endpoint is deprecated in favor of `/api/auth/verify-otp-server`.
export async function POST() {
  return NextResponse.json(
    { error: "Deprecated endpoint. Use /api/auth/verify-otp-server instead." },
    { status: 410 }
  );
}
