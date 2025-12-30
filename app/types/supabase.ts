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
            }
        }
    }
}
