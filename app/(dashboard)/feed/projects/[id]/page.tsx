import React from "react";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import ProjectDetailsView from "@/components/project/ProjectDetailsView";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 60; // Revalidate the page itself every minute

// Helper to fetch with caching
async function fetchGitHub(url: string) {
  const token = process.env.GITHUB_ACCESS_TOKEN;
  const headers: HeadersInit = {
    "Accept": "application/vnd.github.v3+json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      if (res.status === 403 || res.status === 429) {
        console.warn(`GitHub API Rate Limit Hit for ${url}`);
      }
      return null;
    }

    // Handle raw content for README
    if (url.endsWith("/readme")) {
      return res.text();
    }

    return res.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function getGitHubData(repoUrl: string | null) {
  if (!repoUrl) return null;

  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

    // Fetch in parallel
    const [repoData, contributorsData, readmeText] = await Promise.all([
      fetchGitHub(baseUrl),
      fetchGitHub(`${baseUrl}/contributors?per_page=5`),
      fetchGitHub(`${baseUrl}/readme`),
    ]);

    if (!repoData) return null;

    const contributors = Array.isArray(contributorsData)
      ? contributorsData.map((c: any) => ({
          login: c.login,
          avatar_url: c.avatar_url,
          contributions: c.contributions,
        }))
      : [];

    // The readme endpoint by default returns JSON with base64 content, 
    // but we can ask for raw v3 media type or just use the download_url if needed.
    // However, the previous code used mediaType: { format: "raw" }.
    // Let's stick to a simple fetch for the raw download URL if we get JSON, 
    // OR we can use the specific Accept header for raw text.
    // For simplicity with fetch, let's try the media accept header approach in the helper
    // BUT for the README specifically, let's be robust.
    
    // Actually, distinct fetch for readme with specific header
    let readme = null;
    const readmeRes = await fetch(`${baseUrl}/readme`, {
        headers: { 
            "Accept": "application/vnd.github.raw",
            ...(process.env.GITHUB_ACCESS_TOKEN ? { "Authorization": `Bearer ${process.env.GITHUB_ACCESS_TOKEN}` } : {})
        },
        next: { revalidate: 3600 }
    });
    if (readmeRes.ok) {
        readme = await readmeRes.text();
    }

    return {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      open_issues: repoData.open_issues_count,
      topics: repoData.topics || [],
      language: repoData.language || "Unknown",
      last_pushed: repoData.pushed_at,
      homepage: repoData.homepage,
      contributors,
      readme,
      owner, 
      repoName: repo 
    };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return null;
  }
}

async function getSimilarProjects(topic: string, language: string) {
  try {
    const q = topic ? `topic:${topic}` : `language:${language}`;
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)} stars:>10&sort=stars&order=desc&per_page=3`;
    
    const data = await fetchGitHub(url);

    if (!data || !data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      html_url: item.html_url,
      stargazers_count: item.stargazers_count,
      language: item.language,
      owner: {
        login: item.owner.login,
        avatar_url: item.owner.avatar_url,
      },
    }));
  } catch (error) {
    console.error("Error fetching similar projects:", error);
    return [];
  }
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch Project from Supabase
  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !project) {
    notFound();
  }

  // 2. Fetch Owner Profile
  const { data: owner } = await supabaseAdmin
    .from("student_profiles")
    .select("id, full_name, avatar_url, university")
    .eq("id", project.student_id)
    .maybeSingle();

  // 3. Fetch GitHub Data
  const githubData = await getGitHubData(project.github_repository);

  // 4. Fetch Similar Projects
  let similarProjects = [];
  if (githubData) {
     const searchTopic = githubData.topics[0] || "";
     const searchLang = githubData.language || "";
     similarProjects = await getSimilarProjects(searchTopic, searchLang);
  }

  // Transform project data to match View Interface
  const projectViewData = {
    ...project,
    title: project.project_title,
  };

  return (
    <ProjectDetailsView 
      project={projectViewData}
      owner={owner}
      githubData={githubData}
      similarProjects={similarProjects}
    />
  );
}