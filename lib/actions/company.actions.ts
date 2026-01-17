"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCompaniesAction() {
    const supabase = await createSupabaseServerClient();

    try {
        const { data, error } = await supabase
            .from('company_profiles')
            .select('id, company_name')
            .order('company_name');

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
