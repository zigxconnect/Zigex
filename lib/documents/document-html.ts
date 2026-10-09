/**
 * Shared shell for the printable documents (internship logbook, payment
 * receipt): an A4 page in the Zigex style that prints cleanly. Every value
 * from the backend goes through `esc`, so text a student or company typed
 * can never become markup or script in the document.
 */

export const CONTACT_EMAIL = "zigexconnect.com@gmail.com";

/** Escape text for HTML content and attribute values. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only http(s) image URLs make it into src="". */
export function safeUrl(value: unknown): string | null {
  try {
    const url = new URL(String(value ?? ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export const fmtDate = (value: unknown, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) => {
  if (!value) return "";
  const raw = String(value);
  const d = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", opts);
};

export const fmtTime = (value: unknown) => {
  if (!value) return "";
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

export const money = (n: unknown) => `${(Number(n) || 0).toLocaleString("en-GB")} FCFA`;

/** Company mark: its logo if it has a usable one, else its initial. */
export function companyMark(name: string, logo: unknown): string {
  const src = safeUrl(logo);
  return src
    ? `<img class="mark" src="${esc(src)}" alt="">`
    : `<span class="mark mark-initial">${esc((name || "?").trim().charAt(0).toUpperCase())}</span>`;
}

export function documentPage({ title, body }: { title: string; body: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root { --navy:#0B1B3F; --ink:#4A5670; --muted:#7B869C; --line:#DCE5F5; --soft:#F3F7FF; --blue:#155DFC; --ok:#067647; --okbg:#ECFDF3; --warn:#B54708; --warnbg:#FFFAEB; --bad:#B42318; --badbg:#FEF3F2; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin:0; background:#EEF2FA; color:var(--navy); font:13px/1.55 Inter, system-ui, sans-serif; }
  h1, h2, h3, .num { font-family: "Host Grotesk", Inter, sans-serif; }
  .page { width:210mm; min-height:297mm; margin:12mm auto; padding:18mm 18mm 16mm; background:#fff; box-shadow:0 1px 3px rgba(11,27,63,.08), 0 8px 24px rgba(11,27,63,.06); display:flex; flex-direction:column; }
  @media (max-width: 840px) { .page { width:auto; min-height:0; margin:0; padding:24px 18px; box-shadow:none; } }
  @page { size:A4; margin:14mm; }
  @media print { body { background:#fff; } .page { width:auto; min-height:0; margin:0; padding:0; box-shadow:none; } .no-print { display:none !important; } tr, .keep { break-inside:avoid; } }

  .top { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; padding-bottom:18px; border-bottom:2px solid var(--navy); }
  .issuer { display:flex; align-items:center; gap:12px; }
  .mark { width:44px; height:44px; border-radius:10px; object-fit:contain; border:1px solid var(--line); padding:4px; background:#fff; }
  .mark-initial { display:flex; align-items:center; justify-content:center; font:700 20px "Host Grotesk", sans-serif; color:var(--blue); padding:0; }
  .issuer-name { font-weight:600; font-size:15px; }
  .issuer-sub { color:var(--ink); font-size:12px; }
  .doc-title { text-align:right; }
  .doc-title h1 { margin:0; font-size:24px; line-height:1.15; letter-spacing:-.01em; }
  .doc-title p { margin:4px 0 0; color:var(--ink); font-size:12px; }

  .facts { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px 32px; margin:22px 0 0; }
  .facts div { min-width:0; }
  .facts dt { color:var(--muted); font-size:11.5px; }
  .facts dd { margin:2px 0 0; font-weight:600; overflow-wrap:anywhere; }

  .stats { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); margin:24px 0 0; border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  .stats div { padding:12px 14px; border-left:1px solid var(--line); }
  .stats div:first-child { border-left:0; }
  .stats .num { font-size:20px; font-weight:700; font-variant-numeric:tabular-nums; }
  .stats .lbl { color:var(--ink); font-size:11.5px; }

  h2 { font-size:15px; margin:28px 0 10px; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; font-weight:600; color:var(--ink); font-size:11.5px; padding:8px 10px; background:var(--soft); border-bottom:1px solid var(--line); }
  td { padding:11px 10px; vertical-align:top; border-bottom:1px solid #EEF2FA; }
  .c-date { width:92px; white-space:nowrap; }
  .c-date b { display:block; font-weight:600; }
  .c-date span { color:var(--muted); font-size:11.5px; }
  .c-status { width:104px; }
  .report { white-space:pre-line; }
  .sub { color:var(--ink); font-size:12px; margin-top:6px; }
  .comment { margin-top:8px; padding:6px 10px; background:var(--soft); border-radius:8px; font-size:12px; }
  .chip { display:inline-block; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600; white-space:nowrap; }
  .chip.ok { background:var(--okbg); color:var(--ok); } .chip.warn { background:var(--warnbg); color:var(--warn); } .chip.bad { background:var(--badbg); color:var(--bad); }
  .empty { text-align:center; color:var(--muted); padding:28px 10px; }
  .right { text-align:right; } .tabular { font-variant-numeric:tabular-nums; }

  .signatures { display:grid; grid-template-columns:1fr 1fr; gap:48px; margin-top:auto; padding-top:56px; }
  .sig { border-top:1px solid var(--navy); padding-top:8px; }
  .sig b { display:block; font-weight:600; } .sig span { color:var(--ink); font-size:12px; }
  .foot { margin-top:28px; padding-top:12px; border-top:1px solid var(--line); color:var(--muted); font-size:11px; display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; }

  .print { position:fixed; right:24px; bottom:24px; border:0; border-radius:12px; padding:12px 18px; background:var(--blue); color:#fff; font:600 14px Inter, sans-serif; cursor:pointer; box-shadow:0 6px 20px rgba(21,93,252,.3); }
  .print:focus-visible { outline:2px solid var(--navy); outline-offset:2px; }
</style>
</head>
<body>
<button type="button" class="print no-print" id="print" hidden>Print or save as PDF</button>
<main class="page">
${body}
</main>
<script>
  // Inside the workspace preview the dialog has its own Print button.
  if (window.self === window.top) { var b = document.getElementById("print"); b.hidden = false; b.onclick = function () { window.print(); }; }
  if (new URLSearchParams(location.search).get("print") === "true") setTimeout(function () { window.print(); }, 500);
</script>
</body>
</html>`;
}
