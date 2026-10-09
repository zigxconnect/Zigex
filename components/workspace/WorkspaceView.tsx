"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Building2, CalendarDays, Download, ExternalLink, FileText, Mail, MapPin, MessageCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { cn, slugifyUsername } from "@/lib/utils";
import { StudentAvatar } from "@/components/students/student-ui";
import { RichContentRenderer } from "@/components/ui/RichContentRenderer";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DailyReportModal } from "@/components/sections/intern/DailyReportModal";
import { LogbookPreviewModal } from "@/components/sections/intern/LogbookPreviewModal";
import { getProgramCurriculum, type LevelCurriculum } from "@/lib/data/curriculum";
import { TodayPanel } from "./TodayPanel";
import { AttendanceCard } from "./AttendanceCard";
import { EmptyNote, ListFilters, Panel, ReportRow, TaskDialog, TaskRow, TextLink } from "./WorkspaceLists";
import {
  attendanceCalendar,
  formatDay,
  priorityOf,
  reportStatus,
  sortTasks,
  stripHtml,
  todayState,
  type LogLike,
} from "./workspace-model";

type WorkspaceData = {
  application: any;
  logs: LogLike[];
  tasks: any[];
  announcements?: any[];
  unreadCount?: number;
  fellowInterns: any[];
  fellowSupervisors: any[];
  studentProfile?: any;
  [key: string]: any;
};

type TabId = "overview" | "tasks" | "reports" | "updates" | "learning" | "payments";

const REFRESH_MS = 45_000;
const ink = "text-[#0B1B3F]";
const body = "text-[#4A5670]";

/**
 * The intern's workspace: today's routine first, then the work itself
 * (tasks, reports, updates, learning) with attendance and people alongside.
 */
export function WorkspaceView({ data }: { data: WorkspaceData }) {
  const router = useRouter();
  const { application, logs = [], announcements = [], fellowInterns = [], fellowSupervisors = [] } = data;

  const type: "internship" | "program" | "event" =
    application?.application_type === "program" ? "program" : application?.application_type === "event" ? "event" : "internship";
  const opportunity = (type === "program" ? application?.programs : type === "event" ? application?.event : application?.internships) ?? {};
  const company = opportunity.company_profiles ?? opportunity.company ?? application?.company_profiles ?? null;
  const mentor = application?.supervisor_profiles ?? fellowSupervisors[0] ?? null;

  const [tab, setTab] = useState<TabId>("overview");
  const [tasks, setTasks] = useState<any[]>(data.tasks ?? []);
  const [openTask, setOpenTask] = useState<any | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [logbookOpen, setLogbookOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [unread, setUnread] = useState(data.unreadCount ?? 0);

  useEffect(() => setTasks(data.tasks ?? []), [data.tasks]);

  // Remember the tab in the address (#tasks), so refresh and back keep the place.
  useEffect(() => {
    const fromHash = window.location.hash.slice(1) as TabId;
    if (["overview", "tasks", "reports", "updates", "learning", "payments"].includes(fromHash)) setTab(fromHash);
  }, []);
  const go = (next: TabId) => {
    setTab(next);
    window.history.replaceState(null, "", next === "overview" ? window.location.pathname + window.location.search : `#${next}`);
  };

  // Fresh data while the page is open: poll when visible, plus instant refresh
  // from the backend's event stream when it exists (it fails quietly until then).
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && router.refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    let stream: EventSource | null = typeof EventSource !== "undefined" ? new EventSource("/api/v1/events/stream") : null;
    if (stream) {
      stream.onmessage = refresh;
      stream.onerror = () => {
        stream?.close();
        stream = null;
      };
    }
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      stream?.close();
    };
  }, [router]);

  // Opening Updates marks them read, here and on the backend.
  useEffect(() => {
    if (tab !== "updates") return;
    setUnread(0);
    const ids = announcements.filter((a: any) => a.is_read === false).map((a: any) => a.id);
    if (ids.length) import("@/lib/actions/intenship.actions").then(({ markWorkspaceAnnouncementsRead }) => markWorkspaceAnnouncementsRead(ids));
  }, [tab, announcements]);

  const openTaskDetails = async (task: any) => {
    setOpenTask(task);
    if (task.is_read) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_read: true } : t)));
    const { markTaskAsRead } = await import("@/lib/actions/intenship.actions");
    await markTaskAsRead(task.id).catch(() => undefined);
  };

  const today = todayState(logs);
  const calendar = useMemo(
    () =>
      attendanceCalendar(logs, {
        start: opportunity.start_date ?? application?.start_date,
        end: opportunity.end_date ?? application?.end_date,
        months: application?.duration_months,
      }),
    [logs, opportunity.start_date, opportunity.end_date, application?.start_date, application?.end_date, application?.duration_months]
  );

  const sortedTasks = useMemo(() => sortTasks(tasks), [tasks]);
  const newTasks = tasks.filter((t) => !t.is_read).length;
  const reports = logs;

  const monthlyRate = Number(opportunity.monthly_rate) || 0;
  const ledger: any[] = application?.payment_ledger ?? [];
  const hasPayments = monthlyRate > 0 || ledger.length > 0;
  const locked = monthlyRate > 0 && !application?.is_paid_acknowledgement;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: "Tasks", count: newTasks || undefined },
    { id: "reports", label: "Reports" },
    { id: "updates", label: "Updates", count: unread || undefined },
    { id: "learning", label: "Learning" },
    ...(hasPayments ? [{ id: "payments" as TabId, label: "Payments" }] : []),
  ];

  const reportTargetId = opportunity.id ?? application?.internship_id ?? application?.program_id ?? application?.event_id;
  const dates =
    opportunity.start_date && opportunity.end_date
      ? `${formatDay(opportunity.start_date, { day: "numeric", month: "short" })} to ${formatDay(opportunity.end_date, { day: "numeric", month: "short", year: "numeric" })}`
      : application?.duration_months
        ? `${application.duration_months} ${application.duration_months === 1 ? "month" : "months"}`
        : null;

  return (
    <div className="mx-auto w-full max-w-6xl pb-28 lg:pb-16">
      {/* Header: what this placement is, and the logbook (the official record). */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <CompanyLogo src={company?.logo_url} name={company?.company_name} />
          <div className="min-w-0">
            <p className={cn("text-sm", body)}>{type === "program" ? "Program" : type === "event" ? "Event" : "Internship"}</p>
            <h1 className={cn("font-heading text-2xl font-bold leading-tight tracking-tight sm:text-[28px]", ink)}>
              {opportunity.title || "Your placement"}
            </h1>
            <ul className={cn("mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm", body)}>
              {company?.company_name && (
                <li className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
                  {company.company_name}
                </li>
              )}
              {opportunity.location && (
                <li className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
                  {opportunity.location}
                </li>
              )}
              {dates && (
                <li className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-[#7B869C]" aria-hidden="true" />
                  {dates}
                </li>
              )}
            </ul>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setLogbookOpen(true)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 text-sm font-semibold text-[#0B1B3F] ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] sm:self-auto"
        >
          <FileText className="h-4 w-4 text-[#155DFC]" aria-hidden="true" />
          Logbook
        </button>
      </header>

      {locked && (
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-5 ring-1 ring-[#DCE5F5] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className={cn("font-heading text-base font-semibold", ink)}>Accept the program fee to start</h2>
            <p className={cn("mt-1 text-sm", body)}>
              This placement costs {monthlyRate.toLocaleString("en-GB")} FCFA a month, paid to {company?.company_name || "the company"}. Zigex doesn&apos;t take payments.
            </p>
          </div>
          <AcceptFee applicationId={application.id} onDone={() => router.refresh()} />
        </div>
      )}

      <div className="mt-6">
        <TodayPanel today={today} startsOn={calendar.hasDates && calendar.workdaysSoFar === 0 ? calendar.start : null} openTasks={newTasks} locked={locked} onOpenTasks={() => go("tasks")} onWriteReport={() => setReportOpen(true)} />
      </div>

      {/* Tabs */}
      <nav aria-label="Workspace" className="sticky top-[64px] z-30 -mx-4 mt-6 border-b border-[#DCE5F5] bg-[#F8FAFF]/95 px-4 backdrop-blur sm:mx-0 sm:px-0">
        <div role="tablist" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => go(t.id)}
              className={cn(
                "relative flex h-12 shrink-0 items-center gap-2 px-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#155DFC]",
                tab === t.id ? "text-[#0B1B3F]" : "text-[#4A5670] hover:text-[#0B1B3F]"
              )}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="rounded-full bg-[#155DFC] px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                  {t.count}
                  <span className="sr-only"> new</span>
                </span>
              )}
              {tab === t.id && <span aria-hidden="true" className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#155DFC]" />}
            </button>
          ))}
        </div>
      </nav>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
        {tab === "overview" && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <Panel
                id="up-next"
                title="Tasks"
                note={tasks.length ? `${newTasks} new, ${tasks.length} in total` : undefined}
                action={tasks.length > 3 ? <TextLink onClick={() => go("tasks")}>All tasks</TextLink> : undefined}
              >
                {sortedTasks.length ? (
                  <ul className="divide-y divide-[#EEF2FA]">
                    {sortedTasks.slice(0, 3).map((task) => (
                      <TaskRow key={task.id} task={task} onOpen={openTaskDetails} />
                    ))}
                  </ul>
                ) : (
                  <EmptyNote title="No tasks yet">Tasks your supervisor gives you appear here, with links and files you need.</EmptyNote>
                )}
              </Panel>

              <Panel
                id="recent-reports"
                title="Recent reports"
                action={reports.length > 3 ? <TextLink onClick={() => go("reports")}>All reports</TextLink> : undefined}
              >
                {reports.length ? (
                  <ul className="divide-y divide-[#EEF2FA]">
                    {reports.slice(0, 3).map((log) => (
                      <ReportRow key={log.id} log={log} />
                    ))}
                  </ul>
                ) : (
                  <EmptyNote title="No reports yet">
                    Send one at the end of each work day. Your reports make up the logbook your certificate is based on.
                  </EmptyNote>
                )}
              </Panel>

              <AboutPanel opportunity={opportunity} />
            </div>

            <aside className="space-y-6" aria-label="Attendance and people">
              <AttendanceCard calendar={calendar} />
              <PeoplePanel mentor={mentor} interns={fellowInterns} onOpenTeam={() => setTeamOpen(true)} />
            </aside>
          </div>
        )}

        {tab === "tasks" && <TasksTab tasks={sortedTasks} onOpen={openTaskDetails} />}
        {tab === "reports" && <ReportsTab logs={reports} onWrite={() => setReportOpen(true)} canWrite={!today.reported && !locked} />}
        {tab === "updates" && <UpdatesTab announcements={announcements} />}
        {tab === "learning" && <LearningTab domain={application?.domain || opportunity.category || opportunity.title || ""} level={application?.experience_level ?? application?.level} />}
        {tab === "payments" && hasPayments && (
          <PaymentsTab applicationId={application.id} monthlyRate={monthlyRate} ledger={ledger} companyName={company?.company_name} />
        )}
      </div>

      {reportOpen && <DailyReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} internshipId={reportTargetId} />}
      <TaskDialog task={openTask} onClose={() => setOpenTask(null)} />
      <TeamDialog open={teamOpen} onClose={() => setTeamOpen(false)} mentor={mentor} supervisors={fellowSupervisors} interns={fellowInterns} />
      <LogbookPreviewModal
        isOpen={logbookOpen}
        onClose={() => setLogbookOpen(false)}
        applicationId={application.id}
        studentName={application.student_profiles?.full_name || application.full_name || "Intern"}
      />
    </div>
  );
}

/* ---------- header pieces ---------- */

function CompanyLogo({ src, name }: { src?: string | null; name?: string | null }) {
  const [failed, setFailed] = useState(false);
  const initial = (name ?? "?").trim().charAt(0).toUpperCase();
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white font-heading text-xl font-bold text-[#155DFC] ring-1 ring-[#DCE5F5]">
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-contain p-1.5" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}

function AcceptFee({ applicationId, onDone }: { applicationId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const { acknowledgePaidInternship } = await import("@/lib/actions/intenship.actions");
        const res = await acknowledgePaidInternship(applicationId).catch(() => ({ success: false }));
        setBusy(false);
        if (res.success) {
          toast.success("Fee accepted. You can check in and send reports now.");
          onDone();
        } else toast.error("That didn't go through. Check your connection and try again.");
      }}
      className="h-11 shrink-0 rounded-xl bg-[#155DFC] px-5 text-[15px] font-semibold text-white hover:bg-[#0F3FB8] disabled:opacity-60"
    >
      {busy ? "Accepting…" : "Accept and start"}
    </button>
  );
}

/* ---------- overview pieces ---------- */

function AboutPanel({ opportunity }: { opportunity: any }) {
  const [expanded, setExpanded] = useState(false);
  const text = stripHtml(opportunity.description);
  const skills: string[] = (opportunity.required_skills ?? [])
    .flatMap((s: string) => String(s).split(","))
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (!text && skills.length === 0) return null;
  const long = text.length > 420;

  return (
    <Panel id="about" title="About this placement">
      <div className="px-5 pb-4 sm:px-6">
        {text && (
          <div className={cn("relative", long && !expanded && "max-h-36 overflow-hidden")}>
            <RichContentRenderer content={opportunity.description} className="prose prose-sm max-w-none text-[15px] leading-relaxed text-[#4A5670] prose-headings:font-heading prose-headings:text-[#0B1B3F] prose-strong:text-[#0B1B3F]" />
            {long && !expanded && <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white" />}
          </div>
        )}
        {long && (
          <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="mt-2 text-sm font-semibold text-[#155DFC] hover:underline">
            {expanded ? "Show less" : "Read the full description"}
          </button>
        )}
        {skills.length > 0 && (
          <div className="mt-5">
            <h3 className={cn("text-sm font-semibold", ink)}>Skills you&apos;ll use</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={s} className="rounded-lg bg-[#F1F4FA] px-2.5 py-1 text-sm text-[#2F3B55]">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Panel>
  );
}

const personOf = (p: any) => ({
  id: p?.id ?? p?.username ?? p?.full_name ?? "member",
  full_name: p?.full_name ?? p?.student_profiles?.full_name ?? "Member",
  avatar_url: p?.avatar_url ?? p?.student_profiles?.avatar_url ?? null,
  username: p?.username ?? p?.student_profiles?.username ?? null,
});

function MentorContact({ mentor }: { mentor: any }) {
  return (
    <div className="flex flex-wrap gap-2">
      {mentor.email && (
        <a href={`mailto:${mentor.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F1F4FA] px-3 text-sm font-medium text-[#0B1B3F] hover:bg-[#E6ECF7]">
          <Mail className="h-4 w-4" aria-hidden="true" />
          Email
        </a>
      )}
      {mentor.whatsapp && (
        <a
          href={`https://wa.me/${String(mentor.whatsapp).replace(/[^\d]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#ECFDF3] px-3 text-sm font-medium text-[#067647] hover:bg-[#DCFAE6]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      )}
    </div>
  );
}

function PeoplePanel({ mentor, interns, onOpenTeam }: { mentor: any; interns: any[]; onOpenTeam: () => void }) {
  const people = interns.map(personOf);
  return (
    <Panel id="people" title="People">
      <div className="space-y-5 px-5 pb-4 sm:px-6">
        <div>
          <h3 className={cn("text-sm font-semibold", ink)}>Your supervisor</h3>
          {mentor ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center gap-3">
                <StudentAvatar s={personOf(mentor) as any} size="h-10 w-10 text-sm" />
                <div className="min-w-0">
                  <p className={cn("truncate font-medium", ink)}>{mentor.full_name}</p>
                  {(mentor.role || mentor.department) && <p className={cn("truncate text-sm", body)}>{mentor.role || mentor.department}</p>}
                </div>
              </div>
              <MentorContact mentor={mentor} />
            </div>
          ) : (
            <p className={cn("mt-1 text-sm", body)}>Not assigned yet. The company will add one; you&apos;ll see them here.</p>
          )}
        </div>

        <div className="border-t border-[#EEF2FA] pt-4">
          <h3 className={cn("text-sm font-semibold", ink)}>Other interns</h3>
          {people.length ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex -space-x-2">
                {people.slice(0, 5).map((p) => (
                  <span key={p.id} className="rounded-full ring-2 ring-white">
                    <StudentAvatar s={p as any} size="h-9 w-9 text-xs" />
                  </span>
                ))}
                {people.length > 5 && (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F4FA] text-xs font-semibold text-[#0B1B3F] ring-2 ring-white">
                    +{people.length - 5}
                  </span>
                )}
              </div>
              <TextLink onClick={onOpenTeam}>See everyone</TextLink>
            </div>
          ) : (
            <p className={cn("mt-1 text-sm", body)}>You&apos;re the only intern here so far.</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function TeamDialog({ open, onClose, mentor, supervisors, interns }: { open: boolean; onClose: () => void; mentor: any; supervisors: any[]; interns: any[] }) {
  const leads = [mentor, ...supervisors].filter(Boolean).filter((s, i, all) => all.findIndex((o) => (o.email ?? o.full_name) === (s.email ?? s.full_name)) === i);
  const people = interns.map(personOf);
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] gap-0 overflow-y-auto rounded-2xl bg-white p-0 sm:max-w-lg">
        <div className="border-b border-[#EEF2FA] px-6 py-5 pr-14">
          <DialogTitle className={cn("font-heading text-xl font-semibold", ink)}>People on this placement</DialogTitle>
          <DialogDescription className={cn("mt-1 text-sm", body)}>
            {leads.length} {leads.length === 1 ? "supervisor" : "supervisors"} and {people.length} {people.length === 1 ? "intern" : "interns"}
          </DialogDescription>
        </div>
        {leads.length > 0 && (
          <section className="px-6 pt-5">
            <h3 className={cn("text-sm font-semibold", ink)}>Supervisors</h3>
            <ul className="mt-2 divide-y divide-[#EEF2FA]">
              {leads.map((s) => (
                <li key={s.email ?? s.full_name} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <StudentAvatar s={personOf(s) as any} size="h-10 w-10 text-sm" />
                    <div>
                      <p className={cn("font-medium", ink)}>{s.full_name}</p>
                      {(s.role || s.department) && <p className={cn("text-sm", body)}>{s.role || s.department}</p>}
                    </div>
                  </div>
                  <MentorContact mentor={s} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="px-6 pb-6 pt-5">
          <h3 className={cn("text-sm font-semibold", ink)}>Interns</h3>
          {people.length ? (
            <ul className="mt-2 divide-y divide-[#EEF2FA]">
              {people.map((p) => (
                <li key={p.id}>
                  <Link
                    href={p.username ? `/profile/${slugifyUsername(p.username)}` : "/dashboard/student"}
                    className="flex items-center gap-3 rounded-lg py-3 hover:bg-[#F8FAFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
                  >
                    <StudentAvatar s={p as any} size="h-10 w-10 text-sm" />
                    <span className={cn("font-medium", ink)}>{p.full_name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={cn("mt-1 text-sm", body)}>No other interns yet.</p>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- tabs ---------- */

function TasksTab({ tasks, onOpen }: { tasks: any[]; onOpen: (t: any) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "high">("all");
  const q = search.trim().toLowerCase();
  const shown = tasks.filter(
    (t) =>
      (filter === "all" || (filter === "new" ? !t.is_read : priorityOf(t) === "high")) &&
      (!q || `${t.title} ${t.description ?? ""}`.toLowerCase().includes(q))
  );
  return (
    <Panel id="tasks" title="Tasks" note="From your supervisor. Open one to see its details, links and files.">
      {tasks.length > 0 && (
        <ListFilters
          search={search}
          onSearch={setSearch}
          placeholder="Search tasks"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "new", label: "New" },
            { value: "high", label: "High priority" },
          ]}
        />
      )}
      {shown.length ? (
        <ul className="mt-2 divide-y divide-[#EEF2FA] border-t border-[#EEF2FA]">
          {shown.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={onOpen} />
          ))}
        </ul>
      ) : tasks.length ? (
        <EmptyNote title="No tasks match">Try another word, or choose All.</EmptyNote>
      ) : (
        <EmptyNote title="No tasks yet">When your supervisor gives you work, it appears here and on your phone if notifications are on.</EmptyNote>
      )}
    </Panel>
  );
}

function ReportsTab({ logs, onWrite, canWrite }: { logs: LogLike[]; onWrite: () => void; canWrite: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const q = search.trim().toLowerCase();
  const shown = logs.filter((l) => (filter === "all" || reportStatus(l) === filter) && (!q || (l.learning_log ?? "").toLowerCase().includes(q)));
  return (
    <Panel
      id="reports"
      title="Daily reports"
      note={`${logs.length} ${logs.length === 1 ? "day" : "days"} recorded. Open one to see the details.`}
      action={
        canWrite ? (
          <button type="button" onClick={onWrite} className="h-10 shrink-0 rounded-xl bg-[#155DFC] px-4 text-sm font-semibold text-white hover:bg-[#0F3FB8]">
            Write today&apos;s report
          </button>
        ) : undefined
      }
    >
      {logs.length > 0 && (
        <ListFilters
          search={search}
          onSearch={setSearch}
          placeholder="Search reports"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "pending", label: "Waiting" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Needs changes" },
          ]}
        />
      )}
      {shown.length ? (
        <ul className="mt-2 divide-y divide-[#EEF2FA] border-t border-[#EEF2FA]">
          {shown.map((l) => (
            <ReportRow key={l.id} log={l} />
          ))}
        </ul>
      ) : logs.length ? (
        <EmptyNote title="No reports match">Try another word, or choose All.</EmptyNote>
      ) : (
        <EmptyNote title="No reports yet">At the end of each work day, write what you did and learned. Two or three sentences are enough.</EmptyNote>
      )}
    </Panel>
  );
}

function UpdatesTab({ announcements }: { announcements: any[] }) {
  const sorted = [...announcements].sort((a, b) => Number(Boolean(b.is_pinned)) - Number(Boolean(a.is_pinned)) || String(b.created_at).localeCompare(String(a.created_at)));
  return (
    <Panel id="updates" title="Updates" note="News from the company and Zigex for this placement.">
      {sorted.length ? (
        <ol className="divide-y divide-[#EEF2FA] border-t border-[#EEF2FA]">
          {sorted.map((a) => (
            <li key={a.id} className="px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#4A5670]">
                <span className="font-medium text-[#0B1B3F]">{a.company?.company_name || a.author?.full_name || "Zigex"}</span>
                <time dateTime={a.created_at}>{formatDay(a.created_at, { day: "numeric", month: "short", year: "numeric" })}</time>
                {a.is_pinned && <span className="rounded-full bg-[#F3F7FF] px-2 py-0.5 text-xs font-semibold text-[#155DFC]">Pinned</span>}
              </div>
              <h3 className="mt-2 font-heading text-lg font-semibold leading-snug text-[#0B1B3F]">{a.title}</h3>
              <RichContentRenderer content={a.content} className="prose prose-sm mt-2 max-w-none text-[15px] leading-relaxed text-[#4A5670]" />
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image_url} alt="" loading="lazy" className="mt-4 max-h-80 w-full rounded-xl object-cover ring-1 ring-[#DCE5F5]" />
              )}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyNote title="No updates yet">When the company or Zigex posts news for your placement, you&apos;ll find it here.</EmptyNote>
      )}
    </Panel>
  );
}

const LEVELS: LevelCurriculum["level"][] = ["Beginner", "Intermediate", "Advanced", "Expert"];

function LearningTab({ domain, level }: { domain: string; level?: string }) {
  const curriculum = getProgramCurriculum(domain);
  const start = LEVELS.find((l) => String(level ?? "").toLowerCase().includes(l.toLowerCase())) ?? "Beginner";
  const [selected, setSelected] = useState<LevelCurriculum["level"]>(start);
  const modules = curriculum?.levels.find((l) => l.level === selected)?.modules ?? [];

  if (!curriculum) {
    return (
      <Panel id="learning" title="Learning">
        <EmptyNote title="No learning path for this placement yet">Ask your supervisor what to read or practise; they can add resources to your tasks.</EmptyNote>
      </Panel>
    );
  }

  return (
    <Panel id="learning" title={`Learning path: ${curriculum.program}`} note="Free lessons to build the skills this placement uses. Start at your level.">
      <div className="px-5 sm:px-6">
        <div role="radiogroup" aria-label="Level" className="flex w-full gap-1 overflow-x-auto rounded-xl bg-[#F1F4FA] p-1 sm:w-fit">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={selected === l}
              onClick={() => setSelected(l)}
              className={cn(
                "h-8 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-medium sm:flex-none",
                selected === l ? "bg-white text-[#0B1B3F] shadow-sm" : "text-[#4A5670] hover:text-[#0B1B3F]"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      {modules.length ? (
        <ol className="mt-4 divide-y divide-[#EEF2FA] border-t border-[#EEF2FA]">
          {modules.map((m, i) => (
            <li key={m.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-4 hover:bg-[#F8FAFF] sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F4FA] text-sm font-semibold text-[#0B1B3F] group-open:bg-[#155DFC] group-open:text-white">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-[#0B1B3F]">{m.title}</span>
                    <span className="block text-sm text-[#4A5670]">
                      {m.duration}, {m.lessons.length} {m.lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                  </span>
                </summary>
                <div className="px-5 pb-5 sm:pl-[4.25rem] sm:pr-6">
                  {m.description && <p className="text-[15px] leading-relaxed text-[#4A5670]">{m.description}</p>}
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {m.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <a
                          href={lesson.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-[#DCE5F5] hover:bg-[#F8FAFF] hover:ring-[#155DFC]"
                        >
                          {lesson.type === "video" ? (
                            <Play className="h-4 w-4 shrink-0 text-[#155DFC]" aria-hidden="true" />
                          ) : (
                            <BookOpen className="h-4 w-4 shrink-0 text-[#155DFC]" aria-hidden="true" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-[#0B1B3F]">{lesson.title}</span>
                            <span className="block text-xs capitalize text-[#7B869C]">
                              {lesson.type}, {lesson.duration}
                            </span>
                          </span>
                          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#9AA6BD]" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyNote title={`No ${selected.toLowerCase()} lessons yet`}>Choose another level.</EmptyNote>
      )}
    </Panel>
  );
}

function PaymentsTab({ applicationId, monthlyRate, ledger, companyName }: { applicationId: string; monthlyRate: number; ledger: any[]; companyName?: string }) {
  const paid = ledger.filter((r) => r.status === "paid").reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const money = (n: number) => `${n.toLocaleString("en-GB")} FCFA`;
  const monthName = (m: number) => new Date(2000, (m || 1) - 1, 1).toLocaleDateString("en-GB", { month: "long" });
  return (
    <Panel id="payments" title="Payments" note={`Paid to ${companyName || "the company"}, which confirms each payment here. Zigex doesn't take payments.`}>
      <dl className="grid grid-cols-2 gap-4 px-5 pb-5 sm:max-w-md sm:px-6">
        <div>
          <dt className="text-sm text-[#4A5670]">Monthly fee</dt>
          <dd className="mt-0.5 font-heading text-xl font-semibold tabular-nums text-[#0B1B3F]">{money(monthlyRate)}</dd>
        </div>
        <div>
          <dt className="text-sm text-[#4A5670]">Paid so far</dt>
          <dd className="mt-0.5 font-heading text-xl font-semibold tabular-nums text-[#0B1B3F]">{money(paid)}</dd>
        </div>
      </dl>
      {ledger.length ? (
        <ul className="divide-y divide-[#EEF2FA] border-t border-[#EEF2FA]">
          {ledger.map((r, i) => (
            <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 sm:px-6">
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-[#0B1B3F]">{monthName(r.month)}</span>
                <span className="block text-sm text-[#4A5670]">
                  {money(Number(r.amount) || 0)}
                  {r.date && `, ${formatDay(r.date, { day: "numeric", month: "short", year: "numeric" })}`}
                </span>
              </span>
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", r.status === "paid" ? "bg-[#ECFDF3] text-[#067647]" : "bg-[#FFFAEB] text-[#B54708]")}>
                {r.status === "paid" ? "Confirmed" : "Waiting"}
              </span>
              {r.status === "paid" && (
                <a
                  href={`/api/internships/receipt/${applicationId}?month=${r.month}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#155DFC] hover:underline"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Receipt
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyNote title="No payments recorded yet">After you pay, the company confirms it here and you can download a receipt.</EmptyNote>
      )}
    </Panel>
  );
}
