// lib/actions/company.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { baseCompanySchema } from "@/lib/validation/company";
import { z } from "zod";

// Define the return type for our server action
type CompanyActionResult = {
  success: boolean;
  data?: z.infer<typeof baseCompanySchema>[];
  error?: string;
  count?: number;
};

/**
 * Server action to get all company profiles from the database
 * No authentication required - fetches all company data
 */
export async function getAllCompanies(): Promise<CompanyActionResult> {
  try {
    console.log("🔍 Fetching all companies from database...");

    const { data: companies, error, count } = await supabaseAdmin
      .from("company_profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    if (!companies || companies.length === 0) {
      console.log("📭 No companies found in database");
      return {
        success: true,
        data: [],
        count: 0,
      };
    }

    console.log(`✅ Found ${companies.length} companies`);
    
    // Validate each company against the schema (optional but good practice)
    const validatedCompanies = companies.map((company, index) => {
      try {
        return baseCompanySchema.parse(company);
      } catch (validationError) {
        console.warn(`⚠️ Company ${index + 1} failed validation:`, validationError);
        return company; // Return as-is if validation fails
      }
    });

    return {
      success: true,
      data: validatedCompanies,
      count: count || companies.length,
    };
  } catch (error) {
    console.error("💥 Unexpected error in getAllCompanies:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Server action to get a specific company by ID
 * No authentication required
 */
export async function getCompanyById(id: string): Promise<CompanyActionResult> {
  try {
    console.log(`🔍 Fetching company with ID: ${id}`);

    // Validate the ID format
    if (!id || typeof id !== 'string') {
      return {
        success: false,
        error: "Invalid company ID provided",
      };
    }

    const { data: company, error } = await supabaseAdmin
      .from("company_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        console.log(`📭 No company found with ID: ${id}`);
        return {
          success: false,
          error: "Company not found",
        };
      }
      
      console.error("❌ Supabase error:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    console.log(`✅ Found company: ${company.company_name}`);

    // Validate against schema
    try {
      const validatedCompany = baseCompanySchema.parse(company);
      return {
        success: true,
        data: [validatedCompany],
        count: 1,
      };
    } catch (validationError) {
      console.warn("⚠️ Company data failed validation:", validationError);
      return {
        success: true,
        data: [company], // Return as-is if validation fails
        count: 1,
      };
    }
  } catch (error) {
    console.error("💥 Unexpected error in getCompanyById:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Server action to get companies by industry
 */
export async function getCompaniesByIndustry(industry: string): Promise<CompanyActionResult> {
  try {
    console.log(`🔍 Fetching companies in industry: ${industry}`);

    const { data: companies, error, count } = await supabaseAdmin
      .from("company_profiles")
      .select("*", { count: "exact" })
      .eq("industry", industry)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error:", error);
      return {
        success: false,
        error: `Database error: ${error.message}`,
      };
    }

    console.log(`✅ Found ${companies?.length || 0} companies in ${industry}`);

    return {
      success: true,
      data: companies || [],
      count: count || 0,
    };
  } catch (error) {
    console.error("💥 Unexpected error in getCompaniesByIndustry:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}