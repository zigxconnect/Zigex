import Link from "next/link";
import { ADMIN_APP_URL } from "@/lib/app-urls";
import { landingButton } from "@/components/sections/landing/landing-ui";

type Workspace = { id: string; title?: string; company_name?: string; logo_url?: string; type?: string };

/**
 * Right-hand rail of the /feed board: one job per audience.
 * Signed out: create an account to apply. Signed in: jump back into work.
 */
export function BoardRail({ signedIn, workspaces }: { signedIn: boolean; workspaces: Workspace[] }) {
  if (!signedIn) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#F3F7FF] p-6 ring-1 ring-[#DCE5F5]">
          <h2 className="font-heading text-lg font-semibold text-[#0B1B3F]">Create an account to apply</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]">
            One free profile lets you apply to any opportunity and follow every application.
          </p>
          <div className="mt-5 grid gap-2">
            <Link href="/sign-up" className={landingButton("primary", "md")}>
              Create your free account
            </Link>
            <Link href="/sign-in" className={landingButton("secondary", "md")}>
              Sign in
            </Link>
          </div>
        </div>
        <p className="px-1 text-sm text-[#4A5670]">
          Hiring?{" "}
          <Link href={`${ADMIN_APP_URL}/company/sign-up`} className="font-semibold text-[#155DFC] hover:underline">
            Post an opportunity
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-6 ring-1 ring-[#DCE5F5]">
        <h2 className="font-heading text-lg font-semibold text-[#0B1B3F]">Your workspaces</h2>
        {workspaces.length === 0 ? (
          <p className="mt-2 text-[15px] leading-relaxed text-[#4A5670]">
            When a company accepts you, your internship or program workspace appears here.
          </p>
        ) : (
          <ul className="mt-4 space-y-1">
            {workspaces.slice(0, 5).map((ws) => (
              <li key={ws.id}>
                <Link
                  href={`/intern/workspace/${ws.type}/${encodeURIComponent(ws.title || "workspace")}?appId=${ws.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#F3F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC]"
                >
                  {ws.logo_url ? (
                    <img src={ws.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-[#DCE5F5]" />
                  ) : (
                    <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F3F7FF] font-semibold text-[#155DFC]">
                      {(ws.company_name ?? ws.title ?? "W").charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#0B1B3F]">{ws.title}</span>
                    {ws.company_name && <span className="block truncate text-[13px] text-[#4A5670]">{ws.company_name}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/dashboard/applied-internships" className={`${landingButton("secondary", "md")} mt-5 w-full`}>
          View my applications
        </Link>
      </div>
    </div>
  );
}
