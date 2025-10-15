// app/api/students/aggregated-data/route.ts
import { NextResponse } from 'next/server';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CompanyProfile {
  company_name: string;
}

interface BaseItem {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
}

interface Internship extends BaseItem {
  company_profiles?: CompanyProfile;
  company?: string | CompanyProfile;
  location?: string;
  type?: string;
  category?: string;
  logo_url?: string;
  cover_image_url?: string;
}

interface Event extends BaseItem {
  start_date?: string;
  end_date?: string;
  company?: string | CompanyProfile;
  event_picture_url?: string;
  location?: string;
}

interface Program extends BaseItem {
  program_category?: string;
  start_date?: string;
  end_date?: string;
  company?: CompanyProfile;
  organizer?: string;
  program_picture_url?: string;
}

interface AggregatedDataResponse {
  success: boolean;
  data: {
    internships: NormalizedInternship[];
    events: NormalizedEvent[];
    programs: NormalizedProgram[];
  };
  metadata: {
    total_count: number;
    internships_count: number;
    events_count: number;
    programs_count: number;
    timestamp: string;
    data_sources: {
      internships: DataSourceStatus;
      events: DataSourceStatus;
      programs: DataSourceStatus;
    };
  };
}

interface DataSourceStatus {
  fetched: boolean;
  count: number;
  error?: string;
}

interface NormalizedInternship {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  category: string;
  logo_url: string;
  cover_image_url: string;
  created_at: string;
}

interface NormalizedEvent {
  id: string;
  title: string;
  description: string;
  company: string;
  start_date: string;
  end_date: string;
  location: string;
  event_picture_url: string;
  created_at: string;
}

interface NormalizedProgram {
  id: string;
  title: string;
  description: string;
  organizer: string;
  program_category: string;
  start_date: string;
  end_date: string;
  program_picture_url: string;
  created_at: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fetches data from an API endpoint with proper error handling
 * @param url - The API endpoint URL
 * @param dataType - Description of data being fetched (for logging)
 * @returns Array of data or empty array on error
 */
async function fetchDataSource<T>(
  url: string,
  dataType: string
): Promise<{ data: T[]; error?: string }> {
  try {
    // Construct the full URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    console.log(`[Aggregator] Fetching ${dataType} from: ${fullUrl}`);

    const response = await fetch(fullUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      console.error(`[Aggregator] Failed to fetch ${dataType}:`, errorMsg);
      return { data: [], error: errorMsg };
    }

    const data = await response.json();
    const resultArray = Array.isArray(data) ? data : [];

    console.log(`[Aggregator] Successfully fetched ${resultArray.length} ${dataType}`);
    return { data: resultArray };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Aggregator] Error fetching ${dataType}:`, errorMsg);
    return { data: [], error: errorMsg };
  }
}

/**
 * Strips HTML tags from a string
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Extracts company name from various company formats
 */
function extractCompanyName(
  company: string | CompanyProfile | undefined,
  fallback: string = 'Not specified'
): string {
  if (!company) return fallback;
  if (typeof company === 'string') return company;
  return company.company_name || fallback;
}

// ============================================================================
// DATA NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalizes internship data into a consistent format for AI context
 */
function normalizeInternships(internships: any[]): NormalizedInternship[] {
  return internships.map((item) => ({
    id: item.id || '',
    title: item.title || 'Untitled Internship',
    description: item.description
      ? stripHtmlTags(item.description)
      : 'No description available',
    company: extractCompanyName(
      item.company_profiles?.company_name || item.company,
      'Confidential'
    ),
    location: item.location || 'Location not specified',
    type: item.type || 'Type not specified',
    category: item.category || 'general',
    logo_url: item.logo_url || '',
    cover_image_url: item.cover_image_url || '',
    created_at: item.created_at || new Date().toISOString(),
  }));
}

/**
 * Normalizes event data into a consistent format for AI context
 */
function normalizeEvents(events: any[]): NormalizedEvent[] {
  return events.map((item) => ({
    id: item.id || '',
    title: item.title || 'Untitled Event',
    description: item.description
      ? stripHtmlTags(item.description)
      : 'No description available',
    company: extractCompanyName(item.company, 'Event Organizer'),
    start_date: item.start_date || '',
    end_date: item.end_date || '',
    location: item.location || 'Location not specified',
    event_picture_url: item.event_picture_url || '',
    created_at: item.created_at || new Date().toISOString(),
  }));
}

/**
 * Normalizes program data into a consistent format for AI context
 */
function normalizePrograms(programs: any[]): NormalizedProgram[] {
  return programs.map((item) => ({
    id: item.id || '',
    title: item.title || 'Untitled Program',
    description: item.description
      ? stripHtmlTags(item.description)
      : 'No description available',
    organizer:
      item.organizer ||
      extractCompanyName(item.company, 'Program Organizer'),
    program_category: item.program_category || 'general',
    start_date: item.start_date || '',
    end_date: item.end_date || '',
    program_picture_url: item.program_picture_url || '',
    created_at: item.created_at || new Date().toISOString(),
  }));
}

// ============================================================================
// API ROUTE HANDLER
// ============================================================================

/**
 * GET /api/students/aggregated-data
 * 
 * Returns all internships, events, and programs in a normalized format
 * optimized for AI context and FastAPI consumption
 * 
 * Response Format:
 * {
 *   success: boolean,
 *   data: {
 *     internships: NormalizedInternship[],
 *     events: NormalizedEvent[],
 *     programs: NormalizedProgram[]
 *   },
 *   metadata: {
 *     total_count: number,
 *     internships_count: number,
 *     events_count: number,
 *     programs_count: number,
 *     timestamp: string,
 *     data_sources: {...}
 *   }
 * }
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  console.log('[Aggregator] Starting data aggregation...');

  try {
    // Fetch all data sources concurrently for optimal performance
    const [internshipsResult, eventsResult, programsResult] = await Promise.all([
      fetchDataSource<Internship>('/api/students/internships', 'internships'),
      fetchDataSource<Event>('/api/students/events', 'events'),
      fetchDataSource<Program>('/api/students/programs', 'programs'),
    ]);

    // Normalize the data
    const internships = normalizeInternships(internshipsResult.data);
    const events = normalizeEvents(eventsResult.data);
    const programs = normalizePrograms(programsResult.data);

    // Build the response
    const response: AggregatedDataResponse = {
      success: true,
      data: {
        internships,
        events,
        programs,
      },
      metadata: {
        total_count: internships.length + events.length + programs.length,
        internships_count: internships.length,
        events_count: events.length,
        programs_count: programs.length,
        timestamp: new Date().toISOString(),
        data_sources: {
          internships: {
            fetched: !internshipsResult.error,
            count: internships.length,
            error: internshipsResult.error,
          },
          events: {
            fetched: !eventsResult.error,
            count: events.length,
            error: eventsResult.error,
          },
          programs: {
            fetched: !programsResult.error,
            count: programs.length,
            error: programsResult.error,
          },
        },
      },
    };

    const duration = Date.now() - startTime;
    console.log(`[Aggregator] Successfully aggregated data in ${duration}ms`);
    console.log(`[Aggregator] Total items: ${response.metadata.total_count}`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[Aggregator] Fatal error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to aggregate data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/students/aggregated-data
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}