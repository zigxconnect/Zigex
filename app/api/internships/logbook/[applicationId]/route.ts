import { NextRequest, NextResponse } from "next/server";
import { loadPlacementDocument } from "@/lib/api/services/placement-documents";
import { CONTACT_EMAIL, companyMark, documentPage, esc, fmtDate, fmtTime } from "@/lib/documents/document-html";

const dayOf = (log: Record<string, any>) => String(log.log_date ?? log.created_at ?? "").slice(0, 10);

function statusChip(status: unknown) {
  const s = String(status ?? "").toLowerCase();
  if (s === "approved" || s === "confirmed") return `<span class="chip ok">Approved</span>`;
  if (s === "rejected") return `<span class="chip bad">Needs changes</span>`;
  return `<span class="chip warn">Waiting</span>`;
}

/** The intern's logbook: every day's report, ready to print and sign. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;

  try {
    // The backend decides who may read this application.
    const doc = await loadPlacementDocument(applicationId, "logbook");
    if ("pdf" in doc) {
      return new NextResponse(doc.pdf.body, {
        headers: { "Content-Type": "application/pdf", "Content-Disposition": doc.pdf.headers.get("content-disposition") ?? "inline" },
      });
    }
    if ("error" in doc) return new NextResponse(doc.message, { status: doc.error });

    const { app, studentProfile } = doc;
    const logs = [...doc.logs].filter((l) => dayOf(l)).sort((a, b) => dayOf(a).localeCompare(dayOf(b)));

    const internship = app.internships ?? {};
    const company = internship.company_profiles ?? app.company_profiles ?? {};
    const companyName = company.company_name || "The host company";
    const studentName = studentProfile?.full_name || app.full_name || "Intern";
    const supervisor = app.supervisor_profiles?.full_name || "";
    const period =
      internship.start_date && internship.end_date
        ? `${fmtDate(internship.start_date)} to ${fmtDate(internship.end_date)}`
        : app.duration_months
          ? `${app.duration_months} ${Number(app.duration_months) === 1 ? "month" : "months"}`
          : "";

    const reported = logs.filter((l) => String(l.learning_log ?? "").trim()).length;
    const approved = logs.filter((l) => ["approved", "confirmed"].includes(String(l.status ?? "").toLowerCase())).length;
    const ratings = logs.map((l) => Number(l.experience_rating)).filter((n) => n > 0);
    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "–";

    const rows = logs
      .map((log) => {
        const tasks: string[] = Array.isArray(log.tasks_completed) ? log.tasks_completed.filter(Boolean) : [];
        const times = [log.check_in_time && `In ${fmtTime(log.check_in_time)}`, log.check_out_time && `out ${fmtTime(log.check_out_time)}`].filter(Boolean).join(", ");
        const summary = String(log.learning_log ?? "").trim();
        return `<tr>
  <td class="c-date"><b>${esc(fmtDate(dayOf(log), { day: "numeric", month: "short" }))}</b><span>${esc(fmtDate(dayOf(log), { weekday: "long" }))}</span></td>
  <td>
    <div class="report">${summary ? esc(summary) : `<span style="color:var(--muted)">Checked in, no report</span>`}</div>
    ${tasks.length ? `<div class="sub"><b>Tasks:</b> ${esc(tasks.join(", "))}</div>` : ""}
    ${times || log.experience_rating ? `<div class="sub">${esc([times, log.experience_rating ? `day rated ${log.experience_rating} of 5` : ""].filter(Boolean).join(". "))}</div>` : ""}
    ${log.supervisor_comment ? `<div class="comment"><b>Supervisor:</b> ${esc(log.supervisor_comment)}</div>` : ""}
  </td>
  <td class="c-status">${summary ? statusChip(log.status) : ""}</td>
</tr>`;
      })
      .join("");

    const body = `
<header class="top">
  <div class="issuer">
    ${companyMark(companyName, company.logo_url)}
    <div><div class="issuer-name">${esc(companyName)}</div><div class="issuer-sub">Internship through Zigex</div></div>
  </div>
  <div class="doc-title"><h1>Internship logbook</h1><p>Printed ${esc(fmtDate(new Date().toISOString()))}</p></div>
</header>

<dl class="facts">
  <div><dt>Intern</dt><dd>${esc(studentName)}</dd></div>
  <div><dt>Internship</dt><dd>${esc(internship.title || "Internship")}</dd></div>
  <div><dt>School</dt><dd>${esc(studentProfile?.university || studentProfile?.school || "Not given")}</dd></div>
  <div><dt>Period</dt><dd>${esc(period || "Not given")}</dd></div>
  <div><dt>Email</dt><dd>${esc(studentProfile?.email || app.email || "Not given")}</dd></div>
  <div><dt>Supervisor</dt><dd>${esc(supervisor || "Not assigned")}</dd></div>
</dl>

<div class="stats keep">
  <div><div class="num">${logs.length}</div><div class="lbl">Days present</div></div>
  <div><div class="num">${reported}</div><div class="lbl">Reports sent</div></div>
  <div><div class="num">${approved}</div><div class="lbl">Approved by supervisor</div></div>
  <div><div class="num">${esc(avg)}</div><div class="lbl">Average day rating (of 5)</div></div>
</div>

<h2>Daily reports</h2>
<table>
  <thead><tr><th class="c-date">Day</th><th>What the intern did and learned</th><th class="c-status">Status</th></tr></thead>
  <tbody>${rows || `<tr><td colspan="3" class="empty">No days recorded yet.</td></tr>`}</tbody>
</table>

<section class="signatures keep">
  <div class="sig"><b>Supervisor</b><span>${esc(supervisor || "Name")}, signature and date</span></div>
  <div class="sig"><b>${esc(companyName)}</b><span>Stamp, signature and date</span></div>
</section>

<footer class="foot">
  <span>Generated by Zigex from the intern's daily check-ins and reports.</span>
  <span>Questions: ${esc(CONTACT_EMAIL)}</span>
</footer>`;

    return new NextResponse(documentPage({ title: `Logbook, ${studentName}`, body }), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
    });
  } catch (error) {
    console.error("[logbook] failed:", error);
    return new NextResponse("The logbook couldn't be created. Try again in a moment.", { status: 500 });
  }
}
