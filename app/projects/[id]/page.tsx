import React from "react";
import { notFound } from "next/navigation";
import ProjectDetailCard from "@/components/uiComponent/ProjectDetailCard";
import { serverApi } from "@/lib/api/server-client";
import { ApiClientError, whenAvailable } from "@/lib/api/errors";

interface Props {
  params: Promise<{ id: string }>;
}

/** Public project page (GET /projects/{id}, spec'd). 404 until the endpoint ships. */
export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  let project: Record<string, any> | null;
  try {
    project = await whenAvailable(
      async () => (await serverApi.get<Record<string, any>>(`/projects/${encodeURIComponent(id)}`)).data,
      null
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    throw error;
  }
  if (!project) notFound();

  // The detail embeds its owner as `student`; the card expects `project_title`.
  const owner = project.student ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProjectDetailCard
          project={{ ...project, project_title: project.project_title ?? project.title } as React.ComponentProps<typeof ProjectDetailCard>["project"]}
          owner={owner}
        />
      </div>
    </div>
  );
}
