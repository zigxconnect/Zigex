import { ProjectData } from "@/app/types/project.types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function checkActiveProject(supabase: SupabaseClient, userId: string): Promise<{
  canCreate: boolean;
  activeProject?: any;
  message?: string;
}> {
  try {
    // Get user's latest project that hasn't expired
    const { data: activeProject, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking active project:', error);
      throw error;
    }

    if (activeProject) {
      const endDate = new Date(activeProject.end_date);
      const remainingDays = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        canCreate: false,
        activeProject,
        message: `You have an active project that expires in ${remainingDays} days. You can only create a new project once your current project expires.`
      };
    }

    return { canCreate: true };
  } catch (error) {
    console.error('Error in checkActiveProject:', error);
    return { 
      canCreate: false, 
      message: 'Error checking project status. Please try again.' 
    };
  }
}