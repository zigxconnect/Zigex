"use server";

import { serverApi } from '@/lib/api/server-client';
import { whenAvailable } from '@/lib/api/errors';

/**
 * Portfolio projects from the backend (GET /projects, spec'd in
 * docs/backend-missing-endpoints.md → Projects). Empty until deployed.
 */

type ProjectView = {
  id: string;
  student_id: string;
  project_title: string;
  description: string;
  cover_image_url: string | null;
  github_repository: string | null;
  project_video_url: string | null;
  uploaded_video_url: string | null;
  project_duration: string;
  end_date: string;
  created_at: string;
  status: string; // 'valid' | 'pending' | 'cancel'
};

interface ActiveProjectResult {
  success: boolean;
  data?: ProjectView | null;
  error?: string;
}

type ProjectRow = Record<string, any> & { id: string };

function toView(row: ProjectRow): ProjectView {
  return {
    id: row.id,
    student_id: row.student_id ?? row.student?.id ?? '',
    project_title: row.title ?? row.project_title ?? '',
    description: row.description ?? '',
    cover_image_url: row.cover_image_url ?? null,
    github_repository: row.github_repository ?? null,
    project_video_url: row.project_video_url ?? null,
    uploaded_video_url: row.uploaded_video_url ?? null,
    project_duration: row.project_duration ?? '',
    end_date: row.end_date ?? '',
    created_at: row.created_at,
    status: row.status ?? 'pending',
  };
}

async function listProjects(query: string): Promise<ProjectView[]> {
  const rows = await whenAvailable(
    async () => (await serverApi.get<ProjectRow[]>(`/projects?${query}`)).data ?? [],
    [] as ProjectRow[]
  );
  return rows.map(toView);
}

const isActive = (project: ProjectView) =>
  project.status !== 'cancel' && (!project.end_date || new Date(project.end_date) > new Date());

/** The signed-in student's current project, if any. */
export async function fetchActiveProject(): Promise<ActiveProjectResult> {
  try {
    const projects = await listProjects('mine=true&limit=20');
    return { success: true, data: projects.find(isActive) ?? null };
  } catch (error) {
    console.error('Error fetching active project:', error);
    return { success: false, error: 'Failed to load your project.' };
  }
}

/** All projects of a student (by student profile id), newest first. */
export async function fetchAllUserProjects(studentProfileId: string): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const projects = await listProjects(`studentId=${encodeURIComponent(studentProfileId)}&limit=50`);
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return { success: false, data: [] };
  }
}

/** A student's current project, for visitors of their profile. */
export async function fetchUserActiveProject(studentProfileId: string): Promise<ActiveProjectResult> {
  const { success, data } = await fetchAllUserProjects(studentProfileId);
  return { success, data: (data as ProjectView[]).find(isActive) ?? null };
}
