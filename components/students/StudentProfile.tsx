import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, GraduationCap, MapPin, Monitor } from "lucide-react";
import { StudentAvatar, tidySchool } from "./student-ui";
import { ShareProfile } from "./ShareProfile";
import { landingButton } from "@/components/sections/landing/landing-ui";

/**
 * A student's profile, as other students (and companies) see it. Shows only
 * what the student wrote to be seen. Never shown, even though the backend
 * returns them: date of birth, GPA, accommodations, phone, email.
 */

type Row = Record<string, any>;
type Project = { id: string; project_title: string; description: string; cover_image_url: string | null; github_repository: string | null; status: string };
type Accepted = { type: string; status: string; title: string; id: string };

const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map(clean).filter(Boolean) : []);
const PLACEHOLDER = new Set(["no", "non", "none", "nil", "n/a", "na", "student", "-"]);
const meaningful = (v: unknown) => {
  const s = clean(v);
  return s && !PLACEHOLDER.has(s.toLowerCase()) ? s : "";
};
const capFirst = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
function safeUrl(raw: unknown) {
  const s = clean(raw);
  if (!s) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function Chips({ items, tone = "plain" }: { items: string[]; tone?: "plain" | "blue" }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className={`rounded-full px-3 py-1 text-sm ${tone === "blue" ? "bg-[#EEF3FF] font-medium text-[#155DFC]" : "bg-[#F3F7FF] text-[#0B1B3F] ring-1 ring-[#E3E9F5]"}`}
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
      <h2 className="font-heading text-base font-semibold text-[#0B1B3F]">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function StudentProfile({
  data,
  projects,
  accepted,
  isMe,
  back,
}: {
  data: Row;
  projects: Project[];
  accepted: Accepted[];
  isMe: boolean;
  back: { href: string; label: string };
}) {
  const name = clean(data.full_name) || "Zigex student";
  const school = tidySchool(clean(data.university)) ?? "";
  const course = clean(data.field_of_study);
  const degree = meaningful(data.degree);
  const location = clean(data.location);
  const gradYear = Number(data.graduation_year) || null;
  const workMode = meaningful(data.work_mode);
  const about = clean(data.about);
  const handle = clean(data.username).replace(/^@+/, "");
  const cover = data.cover_image_url || data.cover_image || null;

  const skills = list(data.hard_skills);
  const strengths = list(data.soft_skills);
  const languages = list(data.languages).flatMap((l) => l.split(",").map((x) => x.trim()).filter(Boolean));
  const roles = list(data.previous_roles);
  const industries = list(data.preferred_industries);
  const interests = list(data.interests);
  const achievements = list(data.achievements);
  const links = [
    { label: "LinkedIn", href: safeUrl(data.linkedin_url) },
    { label: "GitHub", href: safeUrl(data.github_url) },
    { label: "Portfolio", href: safeUrl(data.portfolio_url) },
  ].filter((l) => l.href) as { label: string; href: string }[];
  const shownProjects = projects.filter((p) => p.status !== "cancel");

  // One line that says who they are: "Computer engineering student at University of Bamenda".
  const headline = [course ? `${capFirst(course)} student` : "Student", school && `at ${school}`].filter(Boolean).join(" ");

  const missing = isMe
    ? [
        !data.avatar_url && "a photo",
        !about && "a short intro",
        skills.length === 0 && "your skills",
        links.length === 0 && "a link to your work (LinkedIn, GitHub or a portfolio)",
      ].filter(Boolean)
    : [];

  return (
    <div className="pb-16">
      {isMe ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-[#DCE5F5]">
          <p className="text-sm text-[#0B1B3F]">
            <span className="font-semibold">This is your public profile.</span> It&apos;s what companies and other students see.
          </p>
          <div className="flex items-center gap-2">
            <ShareProfile username={handle || data.id} />
            <Link href="/dashboard/edit-profile" className={`${landingButton("primary", "md")} h-10 px-4 text-sm`}>
              Edit profile
            </Link>
          </div>
        </div>
      ) : (
        <Link
          href={back.href}
          className="mb-6 inline-flex h-10 items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-[#4A5670] hover:text-[#0B1B3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}

      {/* Identity */}
      <header className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
        <div className="h-28 bg-gradient-to-r from-[#0B1B3F] to-[#155DFC] sm:h-36">
          {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="rounded-full ring-4 ring-white">
              <StudentAvatar s={{ id: data.id, full_name: name, avatar_url: data.avatar_url }} size="h-24 w-24 text-3xl" />
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                links.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className={landingButton("secondary", "md")}>
                    {l.label}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ))
              )}
            </div>
          </div>

          <h1 className="mt-4 font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">{name}</h1>
          <p className="mt-1 text-base text-[#4A5670]">{headline}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#4A5670]">
            {handle && <li>@{handle}</li>}
            {location && (
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
                {capFirst(location)}
              </li>
            )}
            {gradYear && (
              <li className="inline-flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
                Class of {gradYear}
              </li>
            )}
            {workMode && (
              <li className="inline-flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
                Prefers {workMode.toLowerCase()} work
              </li>
            )}
          </ul>
        </div>
      </header>

      {isMe && missing.length > 0 && (
        <p className="mt-4 rounded-xl bg-[#EEF3FF] px-4 py-3 text-sm text-[#0B1B3F]">
          Companies read this page when you apply. To make it stronger, add {missing.length > 1 ? `${missing.slice(0, -1).join(", ")} and ${missing.at(-1)}` : missing[0]}.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {about && (
            <Section title="About">
              <p className="whitespace-pre-line text-base leading-relaxed text-[#2B3A55]">{capFirst(about)}</p>
            </Section>
          )}

          {(skills.length > 0 || strengths.length > 0) && (
            <Section title="Skills">
              {skills.length > 0 && <Chips items={skills} tone="blue" />}
              {strengths.length > 0 && (
                <div className={skills.length ? "mt-4" : ""}>
                  <p className="mb-2 text-sm text-[#7B869C]">Strengths</p>
                  <Chips items={strengths} />
                </div>
              )}
            </Section>
          )}

          {shownProjects.length > 0 && (
            <Section title="Projects">
              <ul className="grid gap-4 sm:grid-cols-2">
                {shownProjects.map((p) => (
                  <li key={p.id} className="overflow-hidden rounded-xl ring-1 ring-[#EEF2FA]">
                    {p.cover_image_url && <img src={p.cover_image_url} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                    <div className="p-4">
                      <p className="font-semibold text-[#0B1B3F]">{p.project_title}</p>
                      {p.description && <p className="mt-1 line-clamp-3 text-sm text-[#4A5670]">{p.description}</p>}
                      {safeUrl(p.github_repository) && (
                        <a href={safeUrl(p.github_repository)!} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-[#155DFC] hover:underline">
                          View code
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(roles.length > 0 || achievements.length > 0) && (
            <Section title="Experience">
              {roles.length > 0 && (
                <>
                  <p className="mb-2 text-sm text-[#7B869C]">Roles</p>
                  <Chips items={roles} />
                </>
              )}
              {achievements.length > 0 && (
                <div className={roles.length ? "mt-4" : ""}>
                  <p className="mb-2 text-sm text-[#7B869C]">Achievements</p>
                  <ul className="space-y-1.5 text-base text-[#2B3A55]">
                    {achievements.map((a) => (
                      <li key={a} className="flex gap-2">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#155DFC]" aria-hidden="true" />
                        {capFirst(a)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          {!about && skills.length === 0 && shownProjects.length === 0 && roles.length === 0 && (
            <p className="rounded-2xl bg-white px-6 py-8 text-center text-base text-[#4A5670] ring-1 ring-[#DCE5F5]">
              {isMe ? "Your profile is still empty. Add an intro and your skills so companies know you." : `${name.split(" ")[0]} hasn't added more to their profile yet.`}
            </p>
          )}
        </div>

        <aside className="space-y-6">
          <Section title="Education">
            <dl className="space-y-3 text-sm">
              {school && (
                <div>
                  <dt className="text-[#7B869C]">School</dt>
                  <dd className="mt-0.5 font-medium text-[#0B1B3F]">{school}</dd>
                </div>
              )}
              {course && (
                <div>
                  <dt className="text-[#7B869C]">Course</dt>
                  <dd className="mt-0.5 font-medium text-[#0B1B3F]">{capFirst(course)}</dd>
                </div>
              )}
              {degree && (
                <div>
                  <dt className="text-[#7B869C]">Degree</dt>
                  <dd className="mt-0.5 font-medium text-[#0B1B3F]">{capFirst(degree)}</dd>
                </div>
              )}
              {gradYear && (
                <div>
                  <dt className="text-[#7B869C]">Graduation</dt>
                  <dd className="mt-0.5 font-medium text-[#0B1B3F]">{gradYear}</dd>
                </div>
              )}
              {!school && !course && !degree && !gradYear && <p className="text-[#7B869C]">Not added yet.</p>}
            </dl>
          </Section>

          {accepted.length > 0 && (
            <Section title="On Zigex">
              <ul className="space-y-2 text-sm">
                {accepted.map((a) => (
                  <li key={a.id} className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#155DFC]" aria-hidden="true" />
                    <span className="text-[#0B1B3F]">
                      {a.title}
                      <span className="block text-[#7B869C]">{capFirst(a.type)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(industries.length > 0 || languages.length > 0 || interests.length > 0) && (
            <Section title={isMe ? "More about you" : "More about them"}>
              <div className="space-y-4">
                {industries.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-[#7B869C]">Industries of interest</p>
                    <Chips items={industries} />
                  </div>
                )}
                {languages.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-[#7B869C]">Languages</p>
                    <Chips items={languages} />
                  </div>
                )}
                {interests.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm text-[#7B869C]">Interests</p>
                    <Chips items={interests} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {isMe && links.length > 0 && (
            <Section title="Links">
              <ul className="space-y-2 text-sm">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#155DFC] hover:underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}
