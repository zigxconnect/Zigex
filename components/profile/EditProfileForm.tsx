"use client";

import { SafeImg } from "@/components/SafeImg";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, Check, CheckCircle2, ChevronDown, Loader2, Plus, X } from "lucide-react";
import { saveMyProfile } from "@/lib/actions/profile.actions";
import { uploadAvatar } from "@/lib/api/uploads";
import { usableImageUrl } from "@/lib/images";

const SavedContext = createContext<Set<string>>(new Set());

export type ProfileValues = {
  avatar_url: string;
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
  location: string;
  about: string;
  university: string;
  field_of_study: string;
  degree: string;
  graduation_year: string;
  hard_skills: string[];
  soft_skills: string[];
  languages: string[];
  previous_roles: string[];
  achievements: string[];
  preferred_industries: string[];
  work_mode: string;
  interests: string[];
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  gpa: string;
  accommodations: string;
};

const SKILLS = ["Web development", "Mobile apps", "Python", "JavaScript", "React", "UI/UX design", "Data science", "Machine learning", "Cybersecurity", "Cloud computing", "Networking", "Embedded systems & IoT", "Project management", "Digital marketing", "Graphic design"];
const STRENGTHS = ["Problem solver", "Team player", "Quick learner", "Creative thinker", "Detail-oriented", "Leadership", "Communication", "Self-motivated"];
const LANGUAGES = ["English", "French", "Pidgin", "Spanish", "German", "Arabic"];
const ROLES = ["Software developer", "Frontend developer", "Backend developer", "UI/UX designer", "Data analyst", "Product manager", "Content creator", "Researcher"];
const ACHIEVEMENTS = ["Scholarship recipient", "Dean's list", "Hackathon winner", "Published research", "Club leader"];
const INDUSTRIES = ["Technology & software", "Startups", "Education & EdTech", "Finance & FinTech", "Healthcare", "E-commerce", "Media & entertainment", "Non-profit / NGO", "Government"];
const INTERESTS = ["Technology", "Music", "Sports", "Art", "Volunteering", "Travel", "Reading", "Games"];
const WORK_MODES = ["Remote", "On-site", "Hybrid"];
const SCHOOLS = ["University of Bamenda", "University of Buea", "University of Yaoundé I", "University of Douala", "University of Dschang", "Catholic University of Bamenda", "NAHPI", "COLTECH", "HIBMAT", "HITBAM", "ICT University", "Landmark Metropolitan University"];
const COURSES = ["Computer engineering", "Software engineering", "Computer science", "Electrical engineering", "Telecommunications", "Networking and security", "Accounting", "Business management", "Marketing", "Graphic design"];
const TOWNS = ["Bamenda", "Bambili", "Buea", "Limbe", "Douala", "Yaoundé", "Bafoussam", "Dschang", "Kumba", "Garoua"];

/** "linkedin.com/in/x" → "https://linkedin.com/in/x"; phone → "+237 6XX XX XX XX". */
function tidyOnBlur(k: keyof ProfileValues, value: string): string {
  const v = value.trim();
  if (!v) return v;
  if (["linkedin_url", "github_url", "portfolio_url"].includes(k) && !/^https?:\/\//i.test(v)) return `https://${v.replace(/^\/+/, "")}`;
  if (k === "phone") {
    let d = v.replace(/[^\d+]/g, "");
    if (/^6\d{8}$/.test(d)) d = `+237${d}`;
    if (/^237\d{9}$/.test(d)) d = `+${d}`;
    const m = d.match(/^\+237(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
    return m ? `+237 ${m[1]}${m[2]} ${m[3]} ${m[4]} ${m[5]}` : v;
  }
  return v.replace(/\s+/g, " ");
}


const input =
  "w-full rounded-xl border border-[#DCE5F5] bg-white px-4 text-base text-[#0B1B3F] placeholder:text-[#7B869C] transition-[border-color,box-shadow] hover:border-[#B9C8E6] focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15 aria-[invalid=true]:border-[#D92D20]";

/** What companies notice first, in the order worth doing (same as the feed's profile strength). */
export function strengthSteps(v: ProfileValues) {
  return [
    { label: "Profile photo", done: Boolean(v.avatar_url), section: "basics" },
    { label: "School and course", done: Boolean(v.university.trim() && v.field_of_study.trim()), section: "school" },
    { label: "About you", done: Boolean(v.about.trim()), section: "basics" },
    { label: "Skills", done: v.hard_skills.length > 0, section: "skills" },
    { label: "Location", done: Boolean(v.location.trim()), section: "basics" },
    { label: "A LinkedIn, GitHub or portfolio link", done: Boolean(v.linkedin_url || v.github_url || v.portfolio_url), section: "links" },
  ];
}

function validate(v: ProfileValues): Partial<Record<keyof ProfileValues, string>> {
  const e: Partial<Record<keyof ProfileValues, string>> = {};
  if (v.first_name.trim().length < 2) e.first_name = "Enter your first name.";
  if (v.last_name.trim().length < 2) e.last_name = "Enter your last name.";
  if (v.username && !/^[A-Za-z0-9._-]{3,30}$/.test(v.username)) e.username = "Use 3–30 letters, numbers, dots, dashes or underscores. No spaces.";
  if (v.phone && !/^\+?[0-9 ]{8,16}$/.test(v.phone.trim())) e.phone = "Enter a phone number like +237 6XX XX XX XX.";
  if (v.graduation_year && !/^(19|20)\d{2}$/.test(v.graduation_year)) e.graduation_year = "Enter a year like 2027.";
  if (v.gpa && !(Number(v.gpa) >= 0 && Number(v.gpa) <= 5)) e.gpa = "Enter a number between 0 and 5.";
  for (const k of ["linkedin_url", "github_url", "portfolio_url"] as const) {
    if (v[k] && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v[k])) e[k] = "That doesn\u2019t look like a web link. Paste the address from your browser.";
  }
  return e;
}

/**
 * Edit profile, kept simple: a live header that looks like your profile, the
 * three groups companies care about, and everything else folded away.
 * Changes save on their own a moment after you stop typing; only changed,
 * valid fields are sent, so nothing already saved can be blanked.
 */
export function EditProfileForm({ initial, email, profileHref }: { initial: ProfileValues; email: string; profileHref: string | null }) {
  const router = useRouter();
  const [v, setV] = useState<ProfileValues>(initial);
  const savedRef = useRef<ProfileValues>(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof ProfileValues, boolean>>>({});
  const [state, setState] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [more, setMore] = useState(false);
  // Fields saved in the last few seconds get a small check next to their label.
  const [justSaved, setJustSaved] = useState<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const errors = useMemo(() => validate(v), [v]);
  const steps = strengthSteps(v);
  const percent = Math.round((steps.filter((x) => x.done).length / steps.length) * 100);
  const name = `${v.first_name} ${v.last_name}`.trim() || "Your name";
  const err = (k: keyof ProfileValues) => (touched[k] ? errors[k] : undefined);

  /** Send changed, valid fields; invalid ones wait until they're fixed. */
  const flush = async (current: ProfileValues) => {
    const e = validate(current);
    const changed = (Object.keys(current) as (keyof ProfileValues)[]).filter(
      (k) => k !== "avatar_url" && !e[k] && JSON.stringify(current[k]) !== JSON.stringify(savedRef.current[k])
    );
    if (!changed.length) {
      setState(Object.keys(e).length ? "idle" : "saved");
      return;
    }
    setState("saving");
    try {
      const result = await saveMyProfile(Object.fromEntries(changed.map((k) => [k, current[k]])));
      if (!result.success) throw new Error(result.error);
      savedRef.current = { ...savedRef.current, ...Object.fromEntries(changed.map((k) => [k, current[k]])) };
      setJustSaved(new Set(changed));
      setTimeout(() => setJustSaved(new Set()), 2500);
      const notSaved = (result.unsupported ?? []).filter((k) => k in current);
      setNote(notSaved.length ? "A few fields will save after a Zigex update." : null);
      setState("saved");
      router.refresh();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      setNote(/username/i.test(msg) ? "That username is taken. Try another one." : null);
      if (/username/i.test(msg)) setTouched((t) => ({ ...t, username: true }));
      setState("error");
    }
  };

  const latest = useRef<ProfileValues>(initial);
  const set = <K extends keyof ProfileValues>(k: K, value: ProfileValues[K]) => {
    const next = { ...latest.current, [k]: value };
    latest.current = next;
    setV(next);
    if (timer.current) clearTimeout(timer.current);
    setState("pending");
    // Text saves after a pause in typing; tags and choices save almost at once.
    timer.current = setTimeout(() => flush(latest.current), Array.isArray(value) || k === "work_mode" ? 400 : 1200);
  };
  const touch = (k: keyof ProfileValues) => {
    setTouched((t) => ({ ...t, [k]: true }));
    const value = latest.current[k];
    if (typeof value === "string") {
      const tidy = tidyOnBlur(k, value);
      if (tidy !== value) set(k, tidy as ProfileValues[typeof k]);
    }
  };

  // Don't lose a change that's still waiting to be sent.
  useEffect(() => {
    if (state !== "pending" && state !== "saving") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state]);

  const changePhoto = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadAvatar(file);
      // The backend can return an address on an unconfigured host; saving it would show a broken photo everywhere.
      if (!usableImageUrl(url)) throw new Error("PHOTO_HOST");
      const result = await saveMyProfile({ avatar_url: url });
      if (!result.success) throw new Error(result.error);
      latest.current = { ...latest.current, avatar_url: url };
      setV(latest.current);
      savedRef.current = { ...savedRef.current, avatar_url: url };
      setNote(null);
      setState("saved");
      router.refresh();
    } catch (error) {
      setNote(
        error instanceof Error && error.message === "PHOTO_HOST"
          ? "Profile photos can't be saved right now because of a problem on Zigex's side. We're fixing it; your initials show meanwhile."
          : error instanceof Error && /MB|type|format/i.test(error.message)
            ? error.message
            : "The photo couldn't be uploaded. Use a JPG or PNG under 5 MB."
      );
      setState("error");
    } finally {
      setUploading(false);
    }
  };

  const openSection = (section: string) => {
    if (["experience", "private", "more"].includes(section)) setMore(true);
    requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="pb-16">
      {/* Live header: looks like your profile and updates as you type */}
      <header className="overflow-hidden rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
        <div className="h-24 bg-[linear-gradient(120deg,#0B1B3F_0%,#123A9C_55%,#155DFC_100%)] sm:h-28" />
        <div className="grid gap-6 px-5 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0">
            <div className="-mt-12 flex items-end justify-between gap-3">
              <div className="w-fit rounded-full ring-4 ring-white">
                <PhotoPicker url={v.avatar_url} name={name} busy={uploading} onPick={changePhoto} />
              </div>
              <SaveStatus state={state} onRetry={() => flush(latest.current)} />
            </div>
            <h1 className="mt-3 truncate font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">{name}</h1>
            <p className="mt-1 text-base text-[#4A5670]">
              {v.field_of_study || v.university
                ? [v.field_of_study ? `${v.field_of_study[0].toUpperCase()}${v.field_of_study.slice(1)} student` : "Student", v.university && `at ${v.university}`].filter(Boolean).join(" ")
                : "Add your school and course below"}
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#7B869C]">
              {v.username && <span>@{v.username}</span>}
              {v.location && <span>{v.location}</span>}
              {profileHref && (
                <Link href={profileHref} className="font-semibold text-[#155DFC] hover:underline">
                  View public profile
                </Link>
              )}
            </p>
            {note && <p className="mt-2 text-sm text-[#B54708]">{note}</p>}
          </div>

          <div className="rounded-xl bg-[#F8FAFF] p-4 ring-1 ring-[#EEF2FA] lg:mt-5">
            <div className="flex items-center gap-3">
              <Ring percent={percent} />
              <div>
                <p className="text-sm font-semibold text-[#0B1B3F]">{percent === 100 ? "Your profile is complete" : "Profile strength"}</p>
                <p className="text-sm text-[#4A5670]">{percent === 100 ? "Companies see everything they need." : "Companies read this when you apply."}</p>
              </div>
            </div>
            {percent < 100 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {steps
                  .filter((x) => !x.done)
                  .slice(0, 3)
                  .map((x) =>
                    x.label === "Profile photo" ? (
                      <label key={x.label} className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full bg-white px-3 text-sm font-medium text-[#155DFC] ring-1 ring-[#DCE5F5] hover:ring-[#155DFC]/40">
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        Profile photo
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && changePhoto(e.target.files[0])} />
                      </label>
                    ) : (
                      <button key={x.label} type="button" onClick={() => openSection(x.section)} className="inline-flex h-8 items-center gap-1 rounded-full bg-white px-3 text-sm font-medium text-[#155DFC] ring-1 ring-[#DCE5F5] hover:ring-[#155DFC]/40">
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        {x.label.replace(/^A /, "")}
                      </button>
                    )
                  )}
              </div>
            )}
          </div>
        </div>
      </header>

      <SavedContext.Provider value={justSaved}>
      <form noValidate onSubmit={(e) => e.preventDefault()} className="mt-6 divide-y divide-[#EEF2FA] rounded-2xl bg-white ring-1 ring-[#DCE5F5]">
        <Section id="basics" title="About you" note="Who you are and where you study.">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField k="first_name" label="First name" v={v} set={set} touch={touch} error={err("first_name")} autoComplete="given-name" />
            <TextField k="last_name" label="Last name" v={v} set={set} touch={touch} error={err("last_name")} autoComplete="family-name" />
          </div>
          <div id="school" className="grid scroll-mt-24 gap-5 sm:grid-cols-2">
            <TextField k="university" label="School" v={v} set={set} touch={touch} placeholder="University of Bamenda" options={SCHOOLS} />
            <TextField k="field_of_study" label="Course" v={v} set={set} touch={touch} placeholder="Computer engineering" options={COURSES} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <YearPicker value={v.graduation_year} onChange={(y) => set("graduation_year", y)} />
            <TextField k="location" label="Town" v={v} set={set} touch={touch} placeholder="Bamenda" autoComplete="address-level2" options={TOWNS} />
          </div>
          <TextArea k="about" label="Short intro" v={v} set={set} touch={touch} max={600} hint="Two or three sentences: what you study, what you build, what you're looking for." />
          {!v.about.trim() && (
            <button
              type="button"
              onClick={() => {
                const course = v.field_of_study.trim() || "[your course]";
                const school = v.university.trim() || "[your school]";
                set(
                  "about",
                  `I study ${course.toLowerCase()} at ${school}. I've built [a project you're proud of]. I'm looking for [an internship or program] where I can [what you want to learn or do].`
                );
                requestAnimationFrame(() => {
                  const el = document.getElementById("f-about") as HTMLTextAreaElement | null;
                  if (!el) return;
                  el.focus();
                  const i = el.value.indexOf("[");
                  if (i >= 0) el.setSelectionRange(i, el.value.indexOf("]", i) + 1);
                });
              }}
              className="-mt-3 text-sm font-semibold text-[#155DFC] hover:underline"
            >
              Start from an example
            </button>
          )}
        </Section>

        <Section id="skills" title="Skills" note="Tap to add. Companies look for these first.">
          <Tags label="Skills" value={v.hard_skills} onChange={(x) => set("hard_skills", x)} suggestions={SKILLS} placeholder="Add a skill, like Figma" />
          <Tags label="Languages" value={v.languages} onChange={(x) => set("languages", x)} suggestions={LANGUAGES} placeholder="Add a language" />
        </Section>

        <Section id="links" title="Links" note="Where companies can see your work.">
          <TextField k="linkedin_url" label="LinkedIn" v={v} set={set} touch={touch} error={err("linkedin_url")} type="url" placeholder="https://linkedin.com/in/your-name" />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField k="github_url" label="GitHub" v={v} set={set} touch={touch} error={err("github_url")} type="url" placeholder="https://github.com/your-name" />
            <TextField k="portfolio_url" label="Portfolio or website" v={v} set={set} touch={touch} error={err("portfolio_url")} type="url" placeholder="https://" />
          </div>
        </Section>

        {/* Everything else, folded away */}
        <div id="more" className="scroll-mt-24">
          <button
            type="button"
            onClick={() => setMore((m) => !m)}
            aria-expanded={more}
            className="flex w-full items-center justify-between gap-3 px-5 py-5 text-left sm:px-6 lg:px-8"
          >
            <span>
              <span className="block font-heading text-base font-semibold text-[#0B1B3F]">More details</span>
              <span className="mt-0.5 block text-sm text-[#4A5670]">Optional. Username, phone, experience, interests and private details.</span>
            </span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-[#4A5670] transition-transform ${more ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {more && (
            <div className="divide-y divide-[#EEF2FA] border-t border-[#EEF2FA]">
              <Section id="contact" title="Contact and username" note="Your profile link and how companies reach you.">
                <TextField
                  k="username"
                  label="Username"
                  v={v}
                  set={(k, val) => set(k, String(val).replace(/\s+/g, ""))}
                  touch={touch}
                  error={err("username")}
                  hint={`Your profile link: zigexconnect.com/profile/${v.username || "username"}`}
                  prefix="@"
                />
                <TextField k="phone" label="Phone (WhatsApp)" v={v} set={set} touch={touch} error={err("phone")} type="tel" autoComplete="tel" placeholder="+237 6XX XX XX XX" hint="Only shared with companies you apply to." />
                <p className="text-sm text-[#7B869C]">
                  Sign-in email: <span className="text-[#0B1B3F]">{email}</span>
                </p>
              </Section>
              <Section id="experience" title="Experience" note="Roles you've had (a class project or club counts) and what you'd like next.">
                <TextField k="degree" label="Degree" v={v} set={set} touch={touch} placeholder="Bachelor of Technology" />
                <Tags label="Roles" value={v.previous_roles} onChange={(x) => set("previous_roles", x)} suggestions={ROLES} placeholder="Add a role" />
                <Tags label="Strengths" value={v.soft_skills} onChange={(x) => set("soft_skills", x)} suggestions={STRENGTHS} placeholder="Add a strength" />
                <Tags label="Achievements" value={v.achievements} onChange={(x) => set("achievements", x)} suggestions={ACHIEVEMENTS} placeholder="Add an achievement" />
                <Tags label="Industries you'd like to work in" value={v.preferred_industries} onChange={(x) => set("preferred_industries", x)} suggestions={INDUSTRIES} placeholder="Add an industry" />
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-[#0B1B3F]">How you prefer to work</legend>
                  <div className="flex flex-wrap gap-2">
                    {WORK_MODES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={v.work_mode === m}
                        onClick={() => set("work_mode", v.work_mode === m ? "" : m)}
                        className={`h-10 rounded-full px-4 text-sm font-medium transition-colors ${v.work_mode === m ? "bg-[#0B1B3F] text-white" : "bg-white text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:ring-[#B9C8E6]"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <Tags label="Interests" value={v.interests} onChange={(x) => set("interests", x)} suggestions={INTERESTS} placeholder="Add an interest" />
              </Section>
              <Section id="private" title="Private details" note="Not shown on your profile page. Helps programs support you.">
                <div className="sm:max-w-[12rem]">
                  <TextField k="gpa" label="GPA" v={v} set={set} touch={touch} error={err("gpa")} inputMode="decimal" placeholder="3.2" />
                </div>
                <TextArea k="accommodations" label="Support you need" v={v} set={set} touch={touch} max={400} hint="For example a laptop, transport or accessibility needs." />
              </Section>
            </div>
          )}
        </div>
      </form>
      </SavedContext.Provider>
    </div>
  );
}

/** The one save indicator: no Save button to forget. */
function SaveStatus({ state, onRetry }: { state: "idle" | "pending" | "saving" | "saved" | "error"; onRetry: () => void }) {
  if (state === "idle") return <span className="pb-1 text-sm text-[#7B869C]">Changes save automatically</span>;
  if (state === "pending" || state === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 pb-1 text-sm text-[#4A5670]" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="inline-flex items-center gap-1.5 pb-1 text-sm text-[#067647]" role="status">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        All changes saved
      </span>
    );
  return (
    <span className="inline-flex items-center gap-2 pb-1 text-sm text-[#B42318]" role="alert">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      Not saved.
      <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">
        Try again
      </button>
    </span>
  );
}

function Section({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-24 gap-5 p-5 sm:p-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:p-8">
      <div>
        <h2 id={`${id}-title`} className="font-heading text-base font-semibold text-[#0B1B3F]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#4A5670]">{note}</p>
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

/** Profile strength as a ring: reads at a glance, unlike a thin bar. */
function Ring({ percent }: { percent: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14 shrink-0" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile strength">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E3E9F5" strokeWidth="6" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={percent === 100 ? "#12B76A" : "#155DFC"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * percent) / 100}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-[#0B1B3F]">{percent}%</span>
    </div>
  );
}

type FieldProps = {
  k: keyof ProfileValues;
  label: string;
  v: ProfileValues;
  set: (k: any, value: any) => void;
  touch: (k: keyof ProfileValues) => void;
  error?: string;
  hint?: string;
};

function Message({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error)
    return (
      <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm text-[#B42318]">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {error}
      </p>
    );
  return hint ? (
    <p id={id} className="mt-1.5 text-sm text-[#7B869C]">
      {hint}
    </p>
  ) : null;
}

function SavedTick({ k }: { k: string }) {
  const saved = useContext(SavedContext);
  return saved.has(k) ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#067647]" role="status">
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
      Saved
    </span>
  ) : null;
}

function TextField({
  k,
  label,
  v,
  set,
  touch,
  error,
  hint,
  prefix,
  options,
  ...rest
}: FieldProps & { prefix?: string; options?: string[] } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={`f-${k}`} className="text-sm font-medium text-[#0B1B3F]">
          {label}
        </label>
        <SavedTick k={k} />
      </div>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-[#7B869C]">{prefix}</span>}
        <input
          id={`f-${k}`}
          value={String(v[k] ?? "")}
          onChange={(e) => set(k, e.target.value)}
          onBlur={() => touch(k)}
          aria-invalid={Boolean(error)}
          aria-describedby={`f-${k}-msg`}
          className={`${input} h-12 ${prefix ? "pl-9" : ""}`}
          list={options ? `f-${k}-options` : undefined}
          {...rest}
        />
        {options && (
          <datalist id={`f-${k}-options`}>
            {options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        )}
      </div>
      <Message id={`f-${k}-msg`} error={error} hint={hint} />
    </div>
  );
}

function TextArea({ k, label, v, set, touch, hint, max }: FieldProps & { max: number }) {
  const value = String(v[k] ?? "");
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label htmlFor={`f-${k}`} className="text-sm font-medium text-[#0B1B3F]">
          {label}
        </label>
        <span className="flex items-center gap-3">
          <SavedTick k={k} />
          <span className="text-xs tabular-nums text-[#7B869C]">
            {value.length}/{max}
          </span>
        </span>
      </div>
      <textarea
        id={`f-${k}`}
        rows={4}
        maxLength={max}
        value={value}
        onChange={(e) => set(k, e.target.value)}
        onBlur={() => touch(k)}
        aria-describedby={`f-${k}-msg`}
        className={`${input} resize-y py-3`}
      />
      <Message id={`f-${k}-msg`} hint={hint} />
    </div>
  );
}

/** Pick from suggestions or type your own and press Enter (or comma). */
function Tags({ label, value, onChange, suggestions, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; suggestions: string[]; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const has = (t: string) => value.some((x) => x.toLowerCase() === t.toLowerCase());
  const add = (t: string) => {
    const clean = t.trim().replace(/,$/, "");
    if (clean && !has(clean) && value.length < 15) onChange([...value, clean]);
    setDraft("");
  };
  const remaining = suggestions.filter((s) => !has(s));
  const id = `tags-${label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
        {label}
      </label>
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-[#DCE5F5] bg-white px-2 py-2 focus-within:border-[#155DFC] focus-within:ring-4 focus-within:ring-[#155DFC]/15" onClick={() => inputRef.current?.focus()}>
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#EEF3FF] py-1 pl-3 pr-1 text-sm font-medium text-[#155DFC]">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-[#DCE7FF]">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          value={draft}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? "" : placeholder}
          className="h-8 min-w-[10rem] flex-1 bg-transparent px-2 text-base text-[#0B1B3F] placeholder:text-[#7B869C] focus:outline-none"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`Suggested ${label.toLowerCase()}`}>
          {remaining.slice(0, 8).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-sm text-[#4A5670] ring-1 ring-[#DCE5F5] hover:text-[#0B1B3F] hover:ring-[#B9C8E6]">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoPicker({ url, name, busy, onPick }: { url: string; name: string; busy: boolean; onPick: (f: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const initials = name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        aria-label={url ? "Change profile photo" : "Add a profile photo"}
        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#155DFC] text-2xl font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
      >
        <span>{initials || "?"}</span>
        {usableImageUrl(url) && <SafeImg src={usableImageUrl(url)!} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <span className="absolute inset-0 flex items-center justify-center bg-[#0B1B3F]/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
        </span>
        <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#155DFC] shadow ring-1 ring-[#DCE5F5]" aria-hidden="true">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        </span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

/** Graduation year as quick choices (this year and the next five), plus "Other" for anything else. */
function YearPicker({ value, onChange }: { value: string; onChange: (y: string) => void }) {
  const now = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(now + i));
  const [other, setOther] = useState(Boolean(value) && !years.includes(value));
  return (
    <fieldset>
      <legend className="mb-1.5 flex w-full items-baseline justify-between text-sm font-medium text-[#0B1B3F]">
        Graduation year
        <SavedTick k="graduation_year" />
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            aria-pressed={value === y}
            onClick={() => {
              setOther(false);
              onChange(value === y ? "" : y);
            }}
            className={`h-10 rounded-full px-3.5 text-sm font-medium tabular-nums ${value === y ? "bg-[#0B1B3F] text-white" : "bg-white text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:ring-[#B9C8E6]"}`}
          >
            {y}
          </button>
        ))}
        {other ? (
          <input
            autoFocus
            inputMode="numeric"
            aria-label="Graduation year"
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Year"
            className="h-10 w-24 rounded-full border border-[#DCE5F5] px-3.5 text-sm tabular-nums focus:border-[#155DFC] focus:outline-none focus:ring-4 focus:ring-[#155DFC]/15"
          />
        ) : (
          <button type="button" onClick={() => setOther(true)} className="h-10 rounded-full px-3.5 text-sm font-medium text-[#4A5670] ring-1 ring-[#DCE5F5] hover:ring-[#B9C8E6]">
            Other
          </button>
        )}
      </div>
    </fieldset>
  );
}
