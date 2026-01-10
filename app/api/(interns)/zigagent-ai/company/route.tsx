// /app/api/fupro-ai/company/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Array of fallback logos to assign randomly when company doesn't have a logo
const fallbackLogos = [
  '/seed.png',
  '/sky8.png',
  '/civil.png',
  '/tratz.png',
  '/nervtech.png',
  '/gita.png',
  '/google.png',
  '/valley.png',
];

// Interface matching your original format
interface CompanySuggestion {
  id: string;
  name: string;
  logo: string;
}

/**
 * Gets a random fallback logo from the array
 */
function getRandomFallbackLogo(): string {
  const randomIndex = Math.floor(Math.random() * fallbackLogos.length);
  return fallbackLogos[randomIndex];
}

/**
 * Ensures company names are unique by adding a suffix if needed
 */
function ensureUniqueNames(companies: CompanySuggestion[]): CompanySuggestion[] {
  const nameCount = new Map<string, number>();
  
  return companies.map(company => {
    const originalName = company.name;
    const count = nameCount.get(originalName) || 0;
    nameCount.set(originalName, count + 1);
    
    // If this is a duplicate name, add a suffix
    if (count > 0) {
      return {
        ...company,
        name: `${originalName} (${count + 1})`
      };
    }
    
    return company;
  });
}

export async function GET() {
  try {
    console.log('🔍 Fetching companies from database...');
    
    // Simulate a short network delay for better loading experience
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Fetch all companies from database
    const { data: companies, error } = await supabaseAdmin
      .from('company_profiles')
      .select('id, company_name, logo_url')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch companies from database' }, { status: 500 });
    }
    
    if (!companies || companies.length === 0) {
      console.log('📭 No companies found in database, returning fallback suggestions');
      
      // Fallback to suggested companies if no real data exists
      const fallbackCompanies = [
        { id: 'seed', name: 'Seed', logo: '/seed.png' },
        { id: 'google', name: 'Google', logo: '/sky8.png' },
        { id: 'microsoft', name: 'Microsoft', logo: '/civil.png' },
        { id: 'meta', name: 'Meta', logo: '/tratz.png' },
        { id: 'zixtech', name: 'Zixtech Corporation', logo: '/nervtech.png' },
        { id: 'tratz', name: 'Tratz', logo: '/gita.png' },
        { id: 'mtn', name: 'MTN Cameroon', logo: '/google.png' },
        { id: 'orange', name: 'Orange Cameroun', logo: '/valley.png' },
      ];
      
      return NextResponse.json(fallbackCompanies);
    }
    
    console.log(`✅ Found ${companies.length} companies in database`);
    
    // Transform database companies to match the expected format
    const transformedCompanies: CompanySuggestion[] = companies.map(company => ({
      id: company.id || `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: company.company_name || 'Unknown Company',
      logo: company.logo_url || getRandomFallbackLogo()
    }));
    
    // Ensure company names are unique
    const uniqueCompanies = ensureUniqueNames(transformedCompanies);
    
    console.log(`📊 Returning ${uniqueCompanies.length} companies with unique names`);
    
    // Log some debug info
    const companiesWithFallbackLogos = uniqueCompanies.filter(c => fallbackLogos.includes(c.logo));
    const companiesWithOriginalLogos = uniqueCompanies.filter(c => !fallbackLogos.includes(c.logo));
    
    console.log(`🎨 Companies with original logos: ${companiesWithOriginalLogos.length}`);
    console.log(`🎯 Companies with fallback logos: ${companiesWithFallbackLogos.length}`);
    console.log("here are the unique companies " + uniqueCompanies)
    
    return NextResponse.json(uniqueCompanies);
    
  } catch (error) {
    console.error('💥 [COMPANIES API ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch company suggestions' }, 
      { status: 500 }
    );
  }
}

/**
 * Optional: POST endpoint to add a new company suggestion
 * This could be useful for testing or manual additions
 */
export async function POST(request: Request) {
  try {
    const { company_name, logo_url } = await request.json();
    
    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    
    // Check if company name already exists
    const { data: existingCompany, error: checkError } = await supabaseAdmin
      .from('company_profiles')
      .select('id, company_name')
      .eq('company_name', company_name)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for existing company:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    if (existingCompany) {
      return NextResponse.json({ error: 'Company name already exists' }, { status: 409 });
    }
    
    // Create new company record
    const { data: newCompany, error: insertError } = await supabaseAdmin
      .from('company_profiles')
      .insert({
        company_name,
        email: `info@${company_name.toLowerCase().replace(/\s+/g, '')}.com`, // Auto-generate email
        description: `${company_name} is a dynamic company focused on innovation.`, // Auto-generate description
        logo_url: logo_url || getRandomFallbackLogo(),
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error creating company:', insertError);
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }
    
    console.log('✅ Created new company:', newCompany.company_name);
    
    return NextResponse.json({
      id: newCompany.id,
      name: newCompany.company_name,
      logo: newCompany.logo_url
    }, { status: 201 });
    
  } catch (error) {
    console.error('💥 [CREATE COMPANY ERROR]', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}