// This file will be regenerated from Supabase after running the SQL scripts
// For now, we define placeholder types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'researcher' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'researcher' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'researcher' | 'viewer'
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      studies: {
        Row: {
          id: string
          name: string
          description: string | null
          project_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          project_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          project_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      experiments: {
        Row: {
          id: string
          name: string
          description: string | null
          study_id: string
          protocol_id: string | null
          template_id: string | null
          status: 'configuring' | 'pending' | 'in_progress' | 'completed' | 'signed'
          content: Json
          metadata: Json
          signed_at: string | null
          signed_by: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          study_id: string
          protocol_id?: string | null
          template_id?: string | null
          status?: 'configuring' | 'pending' | 'in_progress' | 'completed' | 'signed'
          content?: Json
          metadata?: Json
          signed_at?: string | null
          signed_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          study_id?: string
          protocol_id?: string | null
          template_id?: string | null
          status?: 'configuring' | 'pending' | 'in_progress' | 'completed' | 'signed'
          content?: Json
          metadata?: Json
          signed_at?: string | null
          signed_by?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      protocols: {
        Row: {
          id: string
          name: string
          description: string | null
          content: Json
          category: string | null
          visibility: 'personal' | 'group' | 'public'
          created_by: string | null
          created_at: string
          updated_at: string
          tags: string[]
          version: number
          is_active: boolean
          estimated_duration_minutes: number | null
          difficulty: 'easy' | 'medium' | 'hard' | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          content?: Json
          category?: string | null
          visibility?: 'personal' | 'group' | 'public'
          created_by?: string | null
          created_at?: string
          updated_at?: string
          tags?: string[]
          version?: number
          is_active?: boolean
          estimated_duration_minutes?: number | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          content?: Json
          category?: string | null
          visibility?: 'personal' | 'group' | 'public'
          created_by?: string | null
          created_at?: string
          updated_at?: string
          tags?: string[]
          version?: number
          is_active?: boolean
          estimated_duration_minutes?: number | null
          difficulty?: 'easy' | 'medium' | 'hard' | null
        }
      }
      samples: {
        Row: {
          id: string
          name: string
          sample_type: string
          description: string | null
          quantity: number | null
          unit: string | null
          concentration: number | null
          concentration_unit: string | null
          storage_unit_id: string | null
          position: string | null
          received_date: string | null
          expiration_date: string | null
          supplier: string | null
          catalog_number: string | null
          lot_number: string | null
          barcode: string | null
          custom_fields: Json
          created_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
          status: 'available' | 'in_use' | 'depleted' | 'expired' | 'disposed'
        }
        Insert: {
          id?: string
          name: string
          sample_type: string
          description?: string | null
          quantity?: number | null
          unit?: string | null
          concentration?: number | null
          concentration_unit?: string | null
          storage_unit_id?: string | null
          position?: string | null
          received_date?: string | null
          expiration_date?: string | null
          supplier?: string | null
          catalog_number?: string | null
          lot_number?: string | null
          barcode?: string | null
          custom_fields?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          status?: 'available' | 'in_use' | 'depleted' | 'expired' | 'disposed'
        }
        Update: {
          id?: string
          name?: string
          sample_type?: string
          description?: string | null
          quantity?: number | null
          unit?: string | null
          concentration?: number | null
          concentration_unit?: string | null
          storage_unit_id?: string | null
          position?: string | null
          received_date?: string | null
          expiration_date?: string | null
          supplier?: string | null
          catalog_number?: string | null
          lot_number?: string | null
          barcode?: string | null
          custom_fields?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
          status?: 'available' | 'in_use' | 'depleted' | 'expired' | 'disposed'
        }
      }
      storage_units: {
        Row: {
          id: string
          name: string
          unit_type: string | null
          description: string | null
          building: string | null
          room: string | null
          temperature: number | null
          capacity: number | null
          parent_unit_id: string | null
          position_format: string | null
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          unit_type?: string | null
          description?: string | null
          building?: string | null
          room?: string | null
          temperature?: number | null
          capacity?: number | null
          parent_unit_id?: string | null
          position_format?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          unit_type?: string | null
          description?: string | null
          building?: string | null
          room?: string | null
          temperature?: number | null
          capacity?: number | null
          parent_unit_id?: string | null
          position_format?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          equipment_type: string | null
          manufacturer: string | null
          model: string | null
          serial_number: string | null
          building: string | null
          room: string | null
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          maintenance_interval_days: number | null
          maintenance_notes: string | null
          status: 'operational' | 'maintenance' | 'out_of_service' | 'reserved'
          is_bookable: boolean
          booking_url: string | null
          notes: string | null
          metadata: Json
          created_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          equipment_type?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          building?: string | null
          room?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          maintenance_interval_days?: number | null
          maintenance_notes?: string | null
          status?: 'operational' | 'maintenance' | 'out_of_service' | 'reserved'
          is_bookable?: boolean
          booking_url?: string | null
          notes?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          equipment_type?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          building?: string | null
          room?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          maintenance_interval_days?: number | null
          maintenance_notes?: string | null
          status?: 'operational' | 'maintenance' | 'out_of_service' | 'reserved'
          is_bookable?: boolean
          booking_url?: string | null
          notes?: string | null
          metadata?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      files: {
        Row: {
          id: string
          name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          folder_path: string
          entity_type: string | null
          entity_id: string | null
          description: string | null
          tags: string[]
          uploaded_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          folder_path?: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          tags?: string[]
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          folder_path?: string
          entity_type?: string | null
          entity_id?: string | null
          description?: string | null
          tags?: string[]
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          notification_type: string | null
          entity_type: string | null
          entity_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          notification_type?: string | null
          entity_type?: string | null
          entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string | null
          notification_type?: string | null
          entity_type?: string | null
          entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          changes: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          changes?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          changes?: Json
          ip_address?: string | null
          user_agent?: string | null
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
