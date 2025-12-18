
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
        return NextResponse.json(
            { error: 'Missing owner or repo query parameters' },
            { status: 400 }
        );
    }

    const token = process.env.GITHUB_TOKEN;

    // Initialize Octokit (works even without token for public repos, but rate limited)
    const octokit = new Octokit({
        auth: token,
    });

    try {
        const [repoData, contributorsData, readmeData] = await Promise.all([
            // 1. Get Repository Info
            octokit.request('GET /repos/{owner}/{repo}', {
                owner,
                repo,
            }),
            // 2. Get Contributors (limit to top 10 for detailed info)
            octokit.request('GET /repos/{owner}/{repo}/contributors', {
                owner,
                repo,
                per_page: 10,
            }),
            // 3. Get README
            octokit.request('GET /repos/{owner}/{repo}/readme', {
                owner,
                repo,
                mediaType: {
                    format: "raw", // Get raw markdown content
                },
            }).catch(() => ({ data: "No README found" })), // Handle case where README doesn't exist
        ]);

        // Construct a simplified response object
        const result = {
            project_name: repoData.data.name,
            description: repoData.data.description,
            stars: repoData.data.stargazers_count,
            forks: repoData.data.forks_count,
            language: repoData.data.language,
            owner: {
                login: repoData.data.owner.login,
                avatar_url: repoData.data.owner.avatar_url,
                url: repoData.data.owner.html_url
            },
            contributors: contributorsData.data.map((c: any) => ({
                login: c.login,
                contributions: c.contributions,
                avatar_url: c.avatar_url,
            })),
            readme_content: readmeData.data,
            fetched_at: new Date().toISOString()
        };

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("GitHub API Error:", error);

        // Check for rate limit or auth errors
        if (error.status === 401) {
            return NextResponse.json({ error: "Authentication failed. Please check your GITHUB_TOKEN." }, { status: 401 });
        }
        if (error.status === 403) {
            return NextResponse.json({ error: "Rate limit exceeded or forbidden. Try adding a GITHUB_TOKEN." }, { status: 403 });
        }
        if (error.status === 404) {
            return NextResponse.json({ error: "Repository not found." }, { status: 404 });
        }

        return NextResponse.json(
            { error: 'Failed to fetch repository data', details: error.message },
            { status: 500 }
        );
    }
}
