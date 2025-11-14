import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProjectDetailCard from "@/components/uiComponent/ProjectDetailCard";
import { supabaseAdmin } from "@/lib/supabase/server";

interface Props {
  params: { id: string };
}

export const revalidate = 60;

export default async function ProjectPage({ params }: Props) {
  const { id } = params;

  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !project) {
    notFound();
  }

  // fetch project owner profile
  const { data: owner } = await supabaseAdmin
    .from('student_profiles')
    .select('id, full_name, avatar_url')
    .eq('id', project.student_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProjectDetailCard project={project} owner={owner} />
      </div>
    </div>
  );
}