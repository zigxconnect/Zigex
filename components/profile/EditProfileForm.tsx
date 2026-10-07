"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, Check, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { saveMyProfile } from "@/lib/actions/profile.actions";
import { uploadAvatar } from "@/lib/api/uploads";

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

const SECTIONS = [
  { id: "basics", label: "Basics" },
  { id: "school", label: "School" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "links", label: "Links and interests" },
  { id: "private", label: "Private details" },
] as const;

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
    if (v[k] && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(v[k])) e[k] = "Paste the full link, starting with https://";
  }
  return e;
}

/**
 * Edit profile: one page in sections (editing isn't a sequence), loaded with
 * what's saved, saving only what changed. A preview and strength meter sit
 * beside the form so students see what companies will see.
 */
export function EditProfileForm({ initial, email, profileHref }: { initial: ProfileValues; email: string; profileHref: string | null }) {
  const router = useRouter();
  const [saved, setSaved] = useState<ProfileValues>(initial);
  const [v, setV] = useState<ProfileValues>(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof ProfileValues, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "error" | "warn"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState<string>("basics");

  const set = <K extends keyof ProfileValues>(k: K, value: ProfileValues[K]) => {
    setV((p) => ({ ...p, [k]: value }));
    setStatus(null);
  };
  const touch = (k: keyof ProfileValues) => setTouched((t) => ({ ...t, [k]: true }));

  const errors = useMemo(() => validate(v), [v]);
  const changed = useMemo(
    () => (Object.keys(v) as (keyof ProfileValues)[]).filter((k) => JSON.stringify(v[k]) !== JSON.stringify(saved[k])),
    [v, saved]
  );
  const dirty = changed.length > 0;
  const steps = strengthSteps(v);
  const percent = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Highlight the section in view in the side navigation.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const save = async () => {
    const problems = changed.filter((k) => errors[k]);
    if (problems.length) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(problems.map((k) => [k, true])) }));
      document.getElementById(`f-${problems[0]}`)?.focus();
      setStatus({ tone: "error", text: "Fix the highlighted fields, then save." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      // Only what changed is sent, so untouched fields can never be blanked by accident.
      const updates = Object.fromEntries(changed.map((k) => [k, v[k]]));
      const result = await saveMyProfile(updates);
      if (!result.success) throw new Error(result.error);
      const notSaved = (result.unsupported ?? []).filter((k) => k in v);
      setSaved(v);
      setStatus(
        notSaved.length
          ? { tone: "warn", text: "Most changes are saved. A few fields can't be saved yet and will work after a Zigex update." }
          : { tone: "ok", text: "Profile saved. Companies see these changes straight away." }
      );
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setStatus({
        tone: "error",
        text: /username/i.test(msg)
          ? "That username is taken. Try another one."
          : "Your changes weren't saved. Check your connection and try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const changePhoto = async (file: File) => {
    setUploading(true);
    setStatus(null);
    try {
      const { url } = await uploadAvatar(file);
      // The photo saves immediately; it's its own action, not part of the form.
      const result = await saveMyProfile({ avatar_url: url });
      if (!result.success) throw new Error(result.error);
      setV((p) => ({ ...p, avatar_url: url }));
      setSaved((p) => ({ ...p, avatar_url: url }));
      setStatus({ tone: "ok", text: "Photo updated." });
      router.refresh();
    } catch (err) {
      setStatus({ tone: "error", text: err instanceof Error && /MB|type|format/i.test(err.message) ? err.message : "The photo couldn't be uploaded. Use a JPG or PNG under 5 MB." });
    } finally {
      setUploading(false);
    }
  };

  const err = (k: keyof ProfileValues) => (touched[k] ? errors[k] : undefined);
  const name = `${v.first_name} ${v.last_name}`.trim() || "Your name";

  return (
    <div className="pb-28">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-[28px] font-bold leading-tight tracking-tight text-[#0B1B3F]">Edit profile</h1>
          <p className="mt-1 text-base text-[#4A5670]">Companies read this when you apply. Changes show on your profile as soon as you save.</p>
        </div>
        {profileHref && (
          <Link href={profileHref} className="text-sm font-semibold text-[#155DFC] hover:underline">
            View your profile
          </Link>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left: preview, strength, sections */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5]">
            <div className="flex items-center gap-3">
              <PhotoPicker url={v.avatar_url} name={name} busy={uploading} onPick={changePhoto} />
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-semibold text-[#0B1B3F]">{name}</p>
                <p className="truncate text-sm text-[#4A5670]">
                  {[v.field_of_study, v.university].filter(Boolean).join(", ") || "Add your school"}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-baseline justify-between">
              <p className="text-sm font-medium text-[#0B1B3F]">Profile strength</p>
              <p className="text-sm font-semibold tabular-nums text-[#155DFC]">{percent}%</p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E3E9F5]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile strength">
              <div className="h-full rounded-full bg-[#155DFC] transition-[width] duration-500" style={{ width: `${percent}%` }} />
            </div>
            <ul className="mt-3 space-y-1.5">
              {steps.map((s) => (
                <li key={s.label}>
                  <a href={`#${s.section}`} className={`flex items-center gap-2 text-sm ${s.done ? "text-[#7B869C]" : "text-[#0B1B3F] hover:text-[#155DFC]"}`}>
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${s.done ? "bg-[#155DFC] text-white" : "ring-1 ring-[#B9C8E6]"}`} aria-hidden="true">
                      {s.done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Sections" className="hidden rounded-2xl bg-white p-2 ring-1 ring-[#DCE5F5] lg:block">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${active === s.id ? "bg-[#EEF3FF] text-[#155DFC]" : "text-[#4A5670] hover:bg-[#F3F7FF] hover:text-[#0B1B3F]"}`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Right: the form */}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="min-w-0 space-y-6"
        >
          <Section id="basics" title="Basics" note="Your name and contact details.">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField k="first_name" label="First name" v={v} set={set} touch={touch} error={err("first_name")} autoComplete="given-name" />
              <TextField k="last_name" label="Last name" v={v} set={set} touch={touch} error={err("last_name")} autoComplete="family-name" />
            </div>
            <TextField
              k="username"
              label="Username"
              v={v}
              set={(k, val) => set(k, String(val).replace(/\s+/g, ""))}
              touch={touch}
              error={err("username")}
              hint="Your profile link: zigexconnect.com/profile/username. Letters, numbers, dots, dashes, underscores."
              prefix="@"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField k="phone" label="Phone (WhatsApp)" v={v} set={set} touch={touch} error={err("phone")} type="tel" autoComplete="tel" placeholder="+237 6XX XX XX XX" hint="Only shared with companies you apply to." />
              <TextField k="location" label="Town" v={v} set={set} touch={touch} placeholder="Bamenda" autoComplete="address-level2" />
            </div>
            <p className="text-sm text-[#7B869C]">
              Sign-in email: <span className="text-[#0B1B3F]">{email}</span>
            </p>
            <TextArea k="about" label="About you" v={v} set={set} touch={touch} max={600} hint="Two or three sentences: what you study, what you build, what you're looking for." />
          </Section>

          <Section id="school" title="School" note="Where you study and when you finish.">
            <TextField k="university" label="School or university" v={v} set={set} touch={touch} placeholder="University of Bamenda" />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField k="field_of_study" label="Course" v={v} set={set} touch={touch} placeholder="Computer engineering" />
              <TextField k="degree" label="Degree" v={v} set={set} touch={touch} placeholder="Bachelor of Technology" />
            </div>
            <div className="sm:max-w-[12rem]">
              <TextField k="graduation_year" label="Graduation year" v={v} set={(k, val) => set(k, String(val).replace(/\D/g, "").slice(0, 4))} touch={touch} error={err("graduation_year")} inputMode="numeric" placeholder="2027" />
            </div>
          </Section>

          <Section id="skills" title="Skills" note="What you can do. Companies search and filter by these.">
            <Tags label="Skills" value={v.hard_skills} onChange={(x) => set("hard_skills", x)} suggestions={SKILLS} placeholder="Add a skill, like Figma" />
            <Tags label="Strengths" value={v.soft_skills} onChange={(x) => set("soft_skills", x)} suggestions={STRENGTHS} placeholder="Add a strength" />
            <Tags label="Languages" value={v.languages} onChange={(x) => set("languages", x)} suggestions={LANGUAGES} placeholder="Add a language" />
          </Section>

          <Section id="experience" title="Experience" note="Roles you've had (a class project or club counts) and what you'd like next.">
            <Tags label="Roles" value={v.previous_roles} onChange={(x) => set("previous_roles", x)} suggestions={ROLES} placeholder="Add a role" />
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
          </Section>

          <Section id="links" title="Links and interests" note="Show your work. Links open from your profile.">
            <TextField k="linkedin_url" label="LinkedIn" v={v} set={set} touch={touch} error={err("linkedin_url")} type="url" placeholder="https://linkedin.com/in/your-name" />
            <TextField k="github_url" label="GitHub" v={v} set={set} touch={touch} error={err("github_url")} type="url" placeholder="https://github.com/your-name" />
            <TextField k="portfolio_url" label="Portfolio or website" v={v} set={set} touch={touch} error={err("portfolio_url")} type="url" placeholder="https://" />
            <Tags label="Interests" value={v.interests} onChange={(x) => set("interests", x)} suggestions={INTERESTS} placeholder="Add an interest" />
          </Section>

          <Section id="private" title="Private details" note="Not shown on your profile page. Helps programs support you.">
            <div className="sm:max-w-[12rem]">
              <TextField k="gpa" label="GPA (optional)" v={v} set={set} touch={touch} error={err("gpa")} inputMode="decimal" placeholder="3.2" />
            </div>
            <TextArea k="accommodations" label="Support you need (optional)" v={v} set={set} touch={touch} max={400} hint="For example a laptop, transport or accessibility needs." />
          </Section>
        </form>
      </div>

      {/* Save bar: appears once something changed, or to report the result */}
      {(dirty || status) && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[#DCE5F5] bg-white/95 backdrop-blur lg:bottom-0 lg:left-64">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <p className={`flex min-w-0 flex-1 items-center gap-2 text-sm ${status?.tone === "error" ? "text-[#B42318]" : status?.tone === "warn" ? "text-[#B54708]" : status ? "text-[#067647]" : "text-[#0B1B3F]"}`} role="status" aria-live="polite">
              {status?.tone === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : status ? <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              <span className="truncate">
                {status?.text ?? `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}`}
              </span>
            </p>
            {dirty && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setV(saved);
                    setTouched({});
                    setStatus(null);
                  }}
                  disabled={saving}
                  className="h-11 rounded-xl px-4 text-[15px] font-semibold text-[#4A5670] hover:bg-[#F3F7FF]"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8] disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:p-6">
      <h2 id={`${id}-title`} className="font-heading text-lg font-semibold text-[#0B1B3F]">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-[#4A5670]">{note}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
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

function TextField({
  k,
  label,
  v,
  set,
  touch,
  error,
  hint,
  prefix,
  ...rest
}: FieldProps & { prefix?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div>
      <label htmlFor={`f-${k}`} className="mb-1.5 block text-sm font-medium text-[#0B1B3F]">
        {label}
      </label>
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
          {...rest}
        />
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
        <span className="text-xs tabular-nums text-[#7B869C]">
          {value.length}/{max}
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
        className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#155DFC] text-xl font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2"
      >
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span>{initials || "?"}</span>}
        <span className="absolute inset-0 flex items-center justify-center bg-[#0B1B3F]/55 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
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
