export interface Project {
    id: string;
    created_at: string;
    updated_at: string;
    owner_id: string;

    // Slide 1: General
    title: string;
    tagline: string;
    problem_statement: string;
    solution_description: string;
    category: string | null;

    // Slide 2: Media
    video_url: string | null;
    cover_images: string[];

    // Slide 3: Investor
    pitch_deck_url: string | null;
    business_model: string | null;
    funding_goal: number | null;
    current_stage: 'idea' | 'prototype' | 'mvp' | 'growth';

    // Slide 4: Developer
    github_url: string | null;
    tech_stack: string[];
    collaboration_type: 'open' | 'paid' | 'mentorship';
    roadmap_url: string | null;

    // Metadata
    is_published: boolean;
    view_count: number;
}

export interface ProjectSubmission {
    id: string;
    created_at: string;
    project_id: string;
    company_id: string;
    status: 'pending' | 'viewed' | 'interested' | 'rejected' | 'meeting_scheduled';
    company_feedback: string | null;

    // Joins
    project?: Project;
}
