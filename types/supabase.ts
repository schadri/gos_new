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
            jobs: {
                Row: {
                    id: string
                    title: string | null
                    company: string | null
                    location: string | null
                    contract_type: string | null
                    experience_required: string | null
                    salary_range: string | null
                    keywords: string[] | null
                    is_featured: boolean | null
                    status: string | null
                    created_at: string
                    created_by: string
                    applications_count: number | null
                    contacted_count: number | null
                    views_count: number | null
                    latitude: number | null
                    longitude: number | null
                    search_radius: number | null
                    description: string | null
                }
                Insert: {
                    id?: string
                    title?: string | null
                    company?: string | null
                    location?: string | null
                    contract_type?: string | null
                    experience_required?: string | null
                    salary_range?: string | null
                    keywords?: string[] | null
                    is_featured?: boolean | null
                    status?: string | null
                    created_at?: string
                    created_by: string
                    applications_count?: number | null
                    contacted_count?: number | null
                    views_count?: number | null
                    latitude?: number | null
                    longitude?: number | null
                    search_radius?: number | null
                    description?: string | null
                }
                Update: {
                    id?: string
                    title?: string | null
                    company?: string | null
                    location?: string | null
                    contract_type?: string | null
                    experience_required?: string | null
                    salary_range?: string | null
                    keywords?: string[] | null
                    is_featured?: boolean | null
                    status?: string | null
                    created_at?: string
                    created_by?: string
                    applications_count?: number | null
                    contacted_count?: number | null
                    views_count?: number | null
                    latitude?: number | null
                    longitude?: number | null
                    search_radius?: number | null
                    description?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    user_type: string | null
                    full_name: string | null
                    profile_photo: string | null
                    company_name: string | null
                    company_logo: string | null
                    location: string | null
                    latitude: number | null
                    longitude: number | null
                    search_radius: number | null
                    position: string[] | null
                    keywords: string[] | null
                    cv_url: string | null
                    updated_at: string | null
                    fcm_token: string | null
                }
                Insert: {
                    id: string
                    user_type?: string | null
                    full_name?: string | null
                    profile_photo?: string | null
                    company_name?: string | null
                    company_logo?: string | null
                    location?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    search_radius?: number | null
                    position?: string[] | null
                    keywords?: string[] | null
                    cv_url?: string | null
                    updated_at?: string | null
                    fcm_token?: string | null
                }
                Update: {
                    id?: string
                    user_type?: string | null
                    full_name?: string | null
                    profile_photo?: string | null
                    company_name?: string | null
                    company_logo?: string | null
                    location?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    search_radius?: number | null
                    position?: string[] | null
                    keywords?: string[] | null
                    cv_url?: string | null
                    updated_at?: string | null
                    fcm_token?: string | null
                }
                Relationships: []
            }
            job_applications: {
                Row: {
                    id: string
                    job_id: string
                    applicant_id: string
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    job_id: string
                    applicant_id: string
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    job_id?: string
                    applicant_id?: string
                    status?: string | null
                    created_at?: string
                }
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    title: string | null
                    description: string | null
                    type: string | null
                    link_url: string | null
                    is_read: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title?: string | null
                    description?: string | null
                    type?: string | null
                    link_url?: string | null
                    is_read?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string | null
                    description?: string | null
                    type?: string | null
                    link_url?: string | null
                    is_read?: boolean | null
                    created_at?: string
                }
            }
            chats: {
                Row: {
                    id: string
                    employer_id: string
                    applicant_id: string
                    job_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    employer_id: string
                    applicant_id: string
                    job_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    employer_id?: string
                    applicant_id?: string
                    job_id?: string | null
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    chat_id: string
                    sender_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    chat_id: string
                    sender_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    chat_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
