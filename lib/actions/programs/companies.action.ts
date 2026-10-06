// lib/actions/company.ts
"use server";

import { baseCompanySchema } from "@/lib/validation/company";
import { z } from "zod";
import { getCompany, listCompanies } from "@/lib/api/services/companies";

// Define the return type for our server action
type CompanyActionResult = {
  success: boolean;
  data?: z.infer<typeof baseCompanySchema>[];
  error?: string;
  count?: number;
};

type Company = z.infer<typeof baseCompanySchema>;

/** All companies (GET /companies). */
export async function getAllCompanies(): Promise<CompanyActionResult> {
  try {
    const companies = (await listCompanies()) as unknown as Company[];
    return { success: true, data: companies, count: companies.length };
  } catch (error) {
    console.error("Error fetching companies:", error);
    return { success: false, error: "Failed to load companies." };
  }
}

/** One company (GET /companies/{id}). */
export async function getCompanyById(id: string): Promise<CompanyActionResult> {
  try {
    const company = await getCompany(id);
    if (!company) return { success: false, error: "Company not found." };
    return { success: true, data: [company as unknown as Company], count: 1 };
  } catch (error) {
    console.error("Error fetching company:", error);
    return { success: false, error: "Failed to load company." };
  }
}

/** Companies in an industry (filtered from GET /companies). */
export async function getCompaniesByIndustry(industry: string): Promise<CompanyActionResult> {
  const all = await getAllCompanies();
  if (!all.success) return all;
  const wanted = industry.toLowerCase();
  const data = (all.data ?? []).filter((c: any) => String(c.industry ?? "").toLowerCase() === wanted);
  return { success: true, data, count: data.length };
}
