"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Hash, MessagesSquare } from "lucide-react";
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
  const [showChat, setShowChat] = useState(false);

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
          Ask questions, share what you&apos;re building and find people to study with. You need a free Discord account to post.
        </p>

        {channels.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Channels">
            {channels.map((c) => (
              <li key={c.id} className="inline-flex items-center gap-1 rounded-full bg-[#F3F7FF] px-3 py-1 text-sm text-[#0B1B3F] ring-1 ring-[#E3E9F5]">
                <Hash className="h-3.5 w-3.5 text-[#7B869C]" aria-hidden="true" />
                {c.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <a href={INVITE} target="_blank" rel="noopener noreferrer" className={landingButton("primary", "md")}>
            Join on Discord
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <button type="button" onClick={() => setShowChat((v) => !v)} aria-expanded={showChat} className={landingButton("secondary", "md")}>
            {showChat ? "Hide the Lounge" : "Read the Lounge here"}
          </button>
        </div>
      </div>

      {showChat && (
        <div className="border-t border-[#EEF2FA]">
          <iframe
            src={`https://e.widgetbot.io/channels/${GUILD_ID}/${LOUNGE_CHANNEL_ID}?color=155DFC&theme=light`}
            title="Zigex Lounge on Discord"
            className="block h-[560px] w-full"
            loading="lazy"
            allow="clipboard-write; fullscreen"
          />
        </div>
      )}
    </section>
  );
}
