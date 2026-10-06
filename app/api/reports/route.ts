import { NextResponse } from "next/server";
import { serverApi } from "@/lib/api/server-client";
import { ApiClientError, isEndpointMissing } from "@/lib/api/errors";

/**
 * Submits a daily report (POST /reports). The backend takes the student from
 * the JWT and sets the points; the client only sends the report itself.
 */
export async function POST(req: Request) {
  try {
    const { programId, report } = await req.json();

    const res = await serverApi.post("/reports", {
      programId,
      date: report?.date,
      content: report?.content,
      skills: report?.skills ?? [],
    });

    return NextResponse.json({ data: res.data }, { status: 201 });
  } catch (error) {
    if (isEndpointMissing(error)) {
      return NextResponse.json({ error: "Daily reports are coming soon." }, { status: 503 });
    }
    if (error instanceof ApiClientError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[reports] submit failed:", error);
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
