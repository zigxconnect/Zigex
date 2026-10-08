import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { BoardItem } from "@/components/feed/board/board-types";

/**
 * Share images (Open Graph / WhatsApp / X previews), 1200×630.
 * Navy ground, the app's own fonts (Host Grotesk + Inter, bundled in
 * assets/fonts), and the Z mark as the one graphic element.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const NAVY = "#0B1B3F";
const BLUE = "#155DFC";
const ICE = "#B9C8E6";
const AMBER = "#FEC84B";

const asset = (path: string) => readFile(join(process.cwd(), "assets", path));
const dataUrl = (buf: Buffer, type = "image/png") => `data:${type};base64,${buf.toString("base64")}`;

async function fonts() {
  const [bold, medium, semibold] = await Promise.all([
    asset("fonts/HostGrotesk-Bold.woff"),
    asset("fonts/Inter-Medium.woff"),
    asset("fonts/Inter-SemiBold.woff"),
  ]);
  return [
    { name: "Host Grotesk", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

async function brand() {
  const [logo, markBlue] = await Promise.all([asset("brand/logo.png"), asset("brand/mark-blue.png")]);
  return { logo: dataUrl(logo), markBlue: dataUrl(markBlue) };
}

/**
 * The opportunity's flyer, cropped from the top like the app's cards and
 * re-encoded small. Null on any failure, so a slow or odd image never breaks
 * the share card.
 */
async function flyer(url: string | null, width: number, height: number): Promise<string | null> {
  if (!url || !/^https:\/\//.test(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    const out = await sharp(input).resize(width, height, { fit: "cover", position: "top" }).jpeg({ quality: 82 }).toBuffer();
    return dataUrl(out, "image/jpeg");
  } catch {
    return null;
  }
}

/** Header row shared by both cards: the tile and the name. */
function Brand({ logo }: { logo: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} width={52} height={52} alt="" />
      <div style={{ fontFamily: "Host Grotesk", fontSize: 34, color: "white", letterSpacing: -0.5 }}>Zigex</div>
    </div>
  );
}

/** The site's default share card. */
export async function siteImage() {
  const [f, b] = await Promise.all([fonts(), brand()]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: NAVY, position: "relative", overflow: "hidden" }}>
        {/* The mark, huge and cropped off the right edge: the one graphic element. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.markBlue} width={760} height={754} alt="" style={{ position: "absolute", right: -250, top: -62 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 820 }}>
          <Brand logo={b.logo} />
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ fontFamily: "Host Grotesk", fontSize: 76, lineHeight: 1.04, letterSpacing: -2, color: "white" }}>
              Internships, programs and events in Cameroon.
            </div>
            <div style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 30, lineHeight: 1.35, color: ICE }}>
              Apply with one profile and follow every reply.
            </div>
          </div>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, color: ICE }}>zigexconnect.com</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: f }
  );
}

const KIND_LABEL = { internships: "Internship", programs: "Program", events: "Event" } as const;
const DEADLINE_VERB = { internships: "Apply by", programs: "Register by", events: "RSVP by" } as const;

const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Douala" }) : null;

function deadlineText(item: BoardItem) {
  const date = shortDate(item.closesAt);
  if (!item.closesAt || !date) return null;
  if (new Date(item.closesAt).getTime() < Date.now()) return "Closed";
  return `${DEADLINE_VERB[item.kind]} ${date}`;
}

function placeText(item: BoardItem) {
  const mode = item.workMode ? item.workMode[0].toUpperCase() + item.workMode.slice(1) : null;
  const place = item.location?.split(",")[0]?.trim() || null;
  if (item.workMode === "remote") return "Remote";
  return [mode, place].filter(Boolean).join(", ") || null;
}

function Chip({ children, accent }: { children: string; accent?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        fontFamily: "Inter",
        fontWeight: 600,
        fontSize: 24,
        color: "white",
      }}
    >
      {accent && <div style={{ width: 10, height: 10, borderRadius: 999, background: AMBER }} />}
      {children}
    </div>
  );
}

/** One opportunity: what it is, who offers it, when to act, and its flyer. */
export async function opportunityImage(item: BoardItem) {
  const PANEL = 456;
  const [f, b, photo] = await Promise.all([fonts(), brand(), flyer(item.image, PANEL, OG_SIZE.height)]);
  const titleSize = item.title.length > 70 ? 50 : item.title.length > 42 ? 60 : 70;
  const deadline = deadlineText(item);
  const place = placeText(item);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: NAVY }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 60px", width: OG_SIZE.width - PANEL }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Brand logo={b.logo} />
            <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 24, color: ICE }}>{KIND_LABEL[item.kind]}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontFamily: "Host Grotesk",
                fontSize: titleSize,
                lineHeight: 1.06,
                letterSpacing: -1.5,
                color: "white",
                lineClamp: 3,
                display: "block",
              }}
            >
              {item.title}
            </div>
            {item.companyName && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Inter", fontWeight: 500, fontSize: 28, color: ICE }}>
                {item.companyName}
                {item.companyVerified && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" fill={BLUE} stroke={BLUE} />
                    <path d="m9 12 2 2 4-4" stroke="white" />
                  </svg>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {deadline && <Chip accent={deadline !== "Closed"}>{deadline}</Chip>}
            {place && <Chip>{place}</Chip>}
            {!deadline && !place && <Chip>zigexconnect.com</Chip>}
          </div>
        </div>

        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={PANEL} height={OG_SIZE.height} alt="" style={{ objectFit: "cover" }} />
        ) : (
          <div style={{ display: "flex", width: PANEL, height: OG_SIZE.height, background: BLUE, position: "relative", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={(await asset("brand/mark-white.png").then((m) => dataUrl(m)))} width={520} height={516} alt="" style={{ position: "absolute", left: 40, top: 58, opacity: 0.18 }} />
          </div>
        )}
      </div>
    ),
    { ...OG_SIZE, fonts: f }
  );
}
