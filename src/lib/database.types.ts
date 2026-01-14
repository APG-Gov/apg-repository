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
      units: {
        Row: {
          id: string
          name: string
          address: string
          duration: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          address: string
          duration?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          duration?: number
          created_at?: string
          updated_at?: string
        }
      }
      time_slots: {
        Row: {
          id: string
          unit_id: string
          date: string
          time: string
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          date: string
          time: string
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          date?: string
          time?: string
          available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          unit_id: string
          time_slot_id: string
          job_id: string
          application_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          cpf: string
          subject: string
          status: 'scheduled' | 'rescheduled' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          time_slot_id: string
          job_id: string
          application_id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          cpf: string
          subject: string
          status?: 'scheduled' | 'rescheduled' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          time_slot_id?: string
          job_id?: string
          application_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          cpf?: string
          subject?: string
          status?: 'scheduled' | 'rescheduled' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}