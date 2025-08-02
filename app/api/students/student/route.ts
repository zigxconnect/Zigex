//  To GET a list of all other students
// File: app/api/students/student/[id]/route.ts
import { supabase } from '@/lib/supabase/client'

// This is a function that provides a list of all students fetching data from the superbase student_profiles table
export async function GET(
  request: Request){
    const {data: students, error} = await supabase
      .from('student_profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Error fetching students:', error.message)
      return Response.json({error: "Error fetching students"})
    }

    return Response.json(students, { status: 200 });
}