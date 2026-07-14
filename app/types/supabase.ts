export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            stories: {
                Row: {
                    id: string
                    user_id: string
                    content: string
                    type: 'image' | 'text' | 'mixed'
                    caption: string | null
                    color: string | null
                    created_at: string
                    expires_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    content: string
                    type: 'image' | 'text' | 'mixed'
                    caption?: string | null
                    color?: string | null
                    created_at?: string
                    expires_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    content?: string
                    type?: 'image' | 'text' | 'mixed'
                    caption?: string | null
                    color?: string | null
                    created_at?: string
                    expires_at?: string
                }
            },
            intern_attendance_v2: {
                Row: {
                    id: string
                    created_at: string
                    student_id: string
                    internship_id: string
                    supervisor_id: string
                    attendance_logs: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    student_id: string
                    internship_id: string
                    supervisor_id: string
                    attendance_logs?: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    student_id?: string
                    internship_id?: string
                    supervisor_id?: string
                    attendance_logs?: Json
                }
            }
        }
    }
}
