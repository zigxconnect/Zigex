"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Hash, Loader2, MessagesSquare } from "lucide-react";
import { landingButton } from "@/components/sections/landing/landing-ui";

const GUILD_ID = "1454830922653368585";
const LOUNGE_CHANNEL_ID = "1454830924004069568";
// Permanent invite; the widget's own invite link expires daily.
const INVITE = "https://discord.gg/wh46mteK";

type Widget = {
  name?: string;
  instant_invite?: string;
  channels?: { id: string; name: string; position: number }[];
  members?: { id: string; username: string; status: string }[];
};

/**
 * The Zigex Discord server: real member count, people online (bots not
 * counted), its channels, a join button, and the Lounge readable here
 * (the chat embed loads only when asked for).
 */
export function DiscordCard() {
  const [widget, setWidget] = useState<Widget | null>(null);
  const [members, setMembers] = useState<number | null>(null);
  // The chat is the main way to take part, so it is open by default.
  const [showChat, setShowChat] = useState(true);
  const [channelId, setChannelId] = useState(LOUNGE_CHANNEL_ID);
  // "loading" until the embed reports in; "slow" if it takes too long (WidgetBot down, or Discord blocked on this network).
  const [chatState, setChatState] = useState<"loading" | "ready" | "slow">("loading");
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!showChat) return;
    setChatState("loading");
    slowTimer.current = setTimeout(() => setChatState((s) => (s === "loading" ? "slow" : s)), 15000);
    return () => {
      if (slowTimer.current) clearTimeout(slowTimer.current);
    };
  }, [showChat, channelId, reload]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const w: Widget = await (await fetch(`https://discord.com/api/guilds/${GUILD_ID}/widget.json`)).json();
        if (cancelled) return;
        setWidget(w);
        // The widget doesn't give a member total; the invite lookup does.
        const code = w.instant_invite?.split("/").pop();
        if (code) {
          const inv = await (await fetch(`https://discord.com/api/v9/invites/${code}?with_counts=true`)).json();
          if (!cancelled && typeof inv.approximate_member_count === "number") setMembers(inv.approximate_member_count);
        }
      } catch {
        // Counts are a nice-to-have; the card works without them.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const online = (widget?.members ?? []).filter((m) => !/bot$/i.test(m.username)).length;
  const channels = [...(widget?.channels ?? [])].sort((a, b) => a.position - b.position);

  return (
    <section aria-labelledby="discord-title" className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5865F2] text-white" aria-hidden="true">
            <MessagesSquare className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 id="discord-title" className="font-heading text-lg font-semibold text-[#0B1B3F]">
              Zigex on Discord
            </h2>
            <p className="mt-0.5 text-sm text-[#4A5670]">
              {members !== null ? `${members} members` : "The Zigex student server"}
              {online > 0 && <span className="text-[#067647]">, {online} online now</span>}
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-[#2B3A55]">
          Ask questions, share what you&apos;re building and find people to study with. Read and post right here; the first time
          you send a message, sign in with Discord in the small window that opens.
        </p>


        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button type="button" onClick={() => setShowChat((v) => !v)} aria-expanded={showChat} className={landingButton(showChat ? "secondary" : "primary", "md")}>
            {showChat ? "Hide the chat" : "Open the chat"}
          </button>
          {/* Joining the full server (Study Rooms, other channels) happens on Discord itself. */}
          <a href={INVITE} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4A5670] hover:text-[#155DFC]">
            Open the full server in Discord
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(opens Discord in a new tab; Zigex stays open)</span>
          </a>
        </div>
      </div>

      {showChat && (
        <div className="border-t border-[#EEF2FA]">
          {channels.length > 1 && (
            <div role="tablist" aria-label="Channels" className="flex gap-1 overflow-x-auto bg-[#F8FAFF] px-4 py-2 sm:px-6">
              {channels.map((c) => {
                const active = c.id === channelId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setChannelId(c.id)}
                    className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] ${
                      active ? "bg-white text-[#0B1B3F] shadow-sm ring-1 ring-[#DCE5F5]" : "text-[#4A5670] hover:text-[#0B1B3F]"
                    }`}
                  >
                    <Hash className="h-3.5 w-3.5 text-[#7B869C]" aria-hidden="true" />
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
          <div className="relative">
            <iframe
              key={`${channelId}-${reload}`}
              src={`https://e.widgetbot.io/channels/${GUILD_ID}/${channelId}?color=155DFC&theme=light`}
              title={`Zigex ${channels.find((c) => c.id === channelId)?.name ?? "Lounge"} chat`}
              className="block h-[520px] w-full sm:h-[600px]"
              loading="lazy"
              allow="clipboard-write; fullscreen"
              onLoad={() => setChatState("ready")}
            />
            {chatState !== "ready" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white px-6 text-center" role="status">
                {chatState === "loading" ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-[#155DFC]" aria-hidden="true" />
                    <p className="text-sm text-[#4A5670]">Loading the chat…</p>
                  </>
                ) : (
                  <>
                    <p className="font-heading text-base font-semibold text-[#0B1B3F]">The chat is taking too long to load.</p>
                    <p className="max-w-sm text-sm text-[#4A5670]">
                      Some school and office networks block Discord. Try again, or open the chat in Discord instead.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <button type="button" onClick={() => setReload((r) => r + 1)} className={landingButton("secondary", "md")}>
                        Try again
                      </button>
                      <a href={INVITE} target="_blank" rel="noopener noreferrer" className={landingButton("primary", "md")}>
                        Open in Discord
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
