import { NextRequest, NextResponse } from "next/server";
import { loadPlacementDocument } from "@/lib/api/services/placement-documents";
import { CONTACT_EMAIL, companyMark, documentPage, esc, fmtDate, money } from "@/lib/documents/document-html";

/**
 * Receipt for one month's placement fee, which the company confirmed in Zigex.
 * The number is stable (placement + month), so the same receipt can be checked later.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  const month = Number.parseInt(req.nextUrl.searchParams.get("month") ?? "", 10);
  if (!(month >= 1 && month <= 12)) return new NextResponse("Choose a month (1 to 12).", { status: 400 });

  try {
    // The backend decides who may read this application.
    const doc = await loadPlacementDocument(applicationId, "receipt", req.nextUrl.search);
    if ("pdf" in doc) {
      return new NextResponse(doc.pdf.body, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": doc.pdf.headers.get("content-disposition") ?? "inline" },
      });
    }
    if ("error" in doc) return new NextResponse(doc.message, { status: doc.error });

    const { app, studentProfile } = doc;
    const record = (app.payment_ledger ?? []).find((r: any) => Number(r.month) === month);
    if (!record || record.status !== "paid") {
      return new NextResponse("There's no confirmed payment for that month yet.", { status: 404 });
    }

    const internship = app.internships ?? {};
    const company = internship.company_profiles ?? app.company_profiles ?? {};
    const companyName = company.company_name || "The host company";
    const studentName = studentProfile?.full_name || app.full_name || "Intern";
    const paidOn = record.date ? new Date(record.date) : null;
    const year = Number(record.year) || (paidOn && !Number.isNaN(paidOn.getTime()) ? paidOn.getFullYear() : new Date().getFullYear());
    const period = new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const receiptNo = `ZX-${String(applicationId).replace(/-/g, "").slice(0, 8).toUpperCase()}-${year}${String(month).padStart(2, "0")}`;

    const body = `
<header class="top">
  <div class="issuer">
    ${companyMark(companyName, company.logo_url)}
    <div><div class="issuer-name">${esc(companyName)}</div><div class="issuer-sub">Internship through Zigex</div></div>
  </div>
  <div class="doc-title"><h1>Payment receipt</h1><p>No. ${esc(receiptNo)}</p></div>
</header>

<dl class="facts">
  <div><dt>Paid by</dt><dd>${esc(studentName)}</dd></div>
  <div><dt>Paid to</dt><dd>${esc(companyName)}</dd></div>
  <div><dt>Email</dt><dd>${esc(studentProfile?.email || app.email || "Not given")}</dd></div>
  <div><dt>Payment date</dt><dd>${esc(fmtDate(record.date) || "Not recorded")}</dd></div>
</dl>

<h2>Details</h2>
<table>
  <thead><tr><th>Description</th><th class="right">Amount</th></tr></thead>
  <tbody>
    <tr>
      <td><b>Placement fee, ${esc(period)}</b><div class="sub">${esc(internship.title || "Internship")}</div></td>
      <td class="right tabular">${esc(money(record.amount))}</td>
    </tr>
    <tr>
      <td class="right"><b>Total paid</b></td>
      <td class="right tabular"><b class="num" style="font-size:18px">${esc(money(record.amount))}</b></td>
    </tr>
  </tbody>
</table>

<p class="sub" style="margin-top:18px"><span class="chip ok">Confirmed</span> &nbsp;${esc(companyName)} confirmed this payment in Zigex. Zigex records the confirmation; it doesn't take payments.</p>

<footer class="foot" style="margin-top:auto">
  <span>Receipt ${esc(receiptNo)}, printed ${esc(fmtDate(new Date().toISOString()))}</span>
  <span>Questions: ${esc(CONTACT_EMAIL)}</span>
</footer>`;

    return new NextResponse(documentPage({ title: `Receipt ${receiptNo}`, body }), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
    });
  } catch (error) {
    console.error("[receipt] failed:", error);
    return new NextResponse("The receipt couldn't be created. Try again in a moment.", { status: 500 });
  }
}
