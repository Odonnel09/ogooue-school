/**
 * TYPES DU SCHÉMA SUPABASE — FICHIER GÉNÉRÉ, NE PAS MODIFIER À LA MAIN.
 *
 * Produit depuis la base réelle. Toute modification manuelle serait perdue à
 * la prochaine génération et, pire, ferait diverger le code du schéma sans
 * que rien ne le signale.
 *
 * Régénérer après chaque migration :
 *   npx supabase gen types typescript --project-id rhxehmymekyusikqfruq
 *     > src/lib/supabase/database.types.ts
 *
 * Ces types décrivent les **lignes de la base** (snake_case). Les types
 * métier de `src/types/` décrivent le **domaine** (camelCase) : les deux
 * cohabitent, et la conversion se fait dans la couche de requêtes.
 *
 * Le schéma `app` n'y figure pas : il n'est pas exposé par l'API. Seules
 * deux façades sont publiques — `correct_grade` et `my_permissions`.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          label: string
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          label: string
          start_date: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          label?: string
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          note: string
          sheet_id: string
          status: string
          student_id: string
        }
        Insert: {
          note?: string
          sheet_id: string
          status: string
          student_id: string
        }
        Update: {
          note?: string
          sheet_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_sheet_id_fkey"
            columns: ["sheet_id"]
            isOneToOne: false
            referencedRelation: "attendance_sheets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sheets: {
        Row: {
          class_id: string
          created_at: string
          date: string
          id: string
          saved_at: string
          taken_by: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          date: string
          id?: string
          saved_at?: string
          taken_by?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          date?: string
          id?: string
          saved_at?: string
          taken_by?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sheets_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sheets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          actor_role: string
          at: string
          detail: string
          domain: string
          id: string
          resource_id: string
          resource_label: string
          resource_type: string
          severity: string
          tenant_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          actor_role?: string
          at?: string
          detail?: string
          domain?: string
          id?: string
          resource_id?: string
          resource_label?: string
          resource_type?: string
          severity?: string
          tenant_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          actor_role?: string
          at?: string
          detail?: string
          domain?: string
          id?: string
          resource_id?: string
          resource_label?: string
          resource_type?: string
          severity?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subjects: {
        Row: {
          class_id: string
          coefficient: number
          created_at: string
          id: string
          subject_id: string
          teacher_id: string | null
          tenant_id: string
          updated_at: string
          weekly_hours: number
        }
        Insert: {
          class_id: string
          coefficient?: number
          created_at?: string
          id?: string
          subject_id: string
          teacher_id?: string | null
          tenant_id: string
          updated_at?: string
          weekly_hours?: number
        }
        Update: {
          class_id?: string
          coefficient?: number
          created_at?: string
          id?: string
          subject_id?: string
          teacher_id?: string | null
          tenant_id?: string
          updated_at?: string
          weekly_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string
          capacity: number
          created_at: string
          cycle: string
          description: string
          id: string
          level_id: string
          main_teacher_id: string | null
          name: string
          room: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          capacity?: number
          created_at?: string
          cycle: string
          description?: string
          id?: string
          level_id: string
          main_teacher_id?: string | null
          name: string
          room?: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          capacity?: number
          created_at?: string
          cycle?: string
          description?: string
          id?: string
          level_id?: string
          main_teacher_id?: string | null
          name?: string
          room?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_main_teacher_id_fkey"
            columns: ["main_teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          pinned: boolean
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          pinned?: boolean
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          pinned?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: string
          last_message_at: string
          related_student_id: string | null
          status: string
          subject: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          last_message_at?: string
          related_student_id?: string | null
          status?: string
          subject: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: string
          last_message_at?: string
          related_student_id?: string | null
          status?: string
          subject?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_related_student_id_fkey"
            columns: ["related_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          accent_color: string
          background: Json
          background_opacity: number
          columns: string[]
          created_at: string
          document_title: string
          footer_text: string
          id: string
          kind: string
          logo: Json
          reference_file: Json
          stamp: Json
          tenant_id: string
          updated_at: string
          variant: string
        }
        Insert: {
          accent_color?: string
          background?: Json
          background_opacity?: number
          columns?: string[]
          created_at?: string
          document_title?: string
          footer_text?: string
          id?: string
          kind?: string
          logo?: Json
          reference_file?: Json
          stamp?: Json
          tenant_id: string
          updated_at?: string
          variant: string
        }
        Update: {
          accent_color?: string
          background?: Json
          background_opacity?: number
          columns?: string[]
          created_at?: string
          document_title?: string
          footer_text?: string
          id?: string
          kind?: string
          logo?: Json
          reference_file?: Json
          stamp?: Json
          tenant_id?: string
          updated_at?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollment_documents: {
        Row: {
          enrollment_id: string
          id: string
          name: string
          provided: boolean
          received_at: string | null
        }
        Insert: {
          enrollment_id: string
          id?: string
          name: string
          provided?: boolean
          received_at?: string | null
        }
        Update: {
          enrollment_id?: string
          id?: string
          name?: string
          provided?: boolean
          received_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollment_documents_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_year_id: string | null
          address: string
          birth_date: string | null
          birth_place: string
          created_at: string
          created_student_id: string | null
          decided_at: string | null
          decided_by: string | null
          decision_note: string
          first_name: string
          gender: string
          guardian_id: string | null
          guardian_relation: string
          id: string
          last_name: string
          nationality: string
          previous_school: string
          reference: string
          requested_class_id: string | null
          requested_level_id: string | null
          status: string
          submitted_at: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          address?: string
          birth_date?: string | null
          birth_place?: string
          created_at?: string
          created_student_id?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string
          first_name: string
          gender: string
          guardian_id?: string | null
          guardian_relation?: string
          id?: string
          last_name: string
          nationality?: string
          previous_school?: string
          reference: string
          requested_class_id?: string | null
          requested_level_id?: string | null
          status?: string
          submitted_at?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          address?: string
          birth_date?: string | null
          birth_place?: string
          created_at?: string
          created_student_id?: string | null
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string
          first_name?: string
          gender?: string
          guardian_id?: string | null
          guardian_relation?: string
          id?: string
          last_name?: string
          nationality?: string
          previous_school?: string
          reference?: string
          requested_class_id?: string | null
          requested_level_id?: string | null
          status?: string
          submitted_at?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_created_student_id_fkey"
            columns: ["created_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_requested_class_id_fkey"
            columns: ["requested_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_requested_level_id_fkey"
            columns: ["requested_level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          class_id: string
          coefficient: number
          created_at: string
          date: string
          description: string
          id: string
          max_score: number
          name: string
          period_id: string | null
          scale: string
          status: string
          subject_id: string
          teacher_id: string | null
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          class_id: string
          coefficient?: number
          created_at?: string
          date: string
          description?: string
          id?: string
          max_score?: number
          name: string
          period_id?: string | null
          scale?: string
          status?: string
          subject_id: string
          teacher_id?: string | null
          tenant_id: string
          type: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          coefficient?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          max_score?: number
          name?: string
          period_id?: string | null
          scale?: string
          status?: string
          subject_id?: string
          teacher_id?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_installments: {
        Row: {
          due_date: string | null
          id: string
          label: string
          percent: number
          position: number
          schedule_id: string
        }
        Insert: {
          due_date?: string | null
          id?: string
          label: string
          percent: number
          position?: number
          schedule_id: string
        }
        Update: {
          due_date?: string | null
          id?: string
          label?: string
          percent?: number
          position?: number
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_installments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "fee_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_items: {
        Row: {
          amount: number
          id: string
          label: string
          mandatory: boolean
          position: number
          schedule_id: string
        }
        Insert: {
          amount: number
          id?: string
          label: string
          mandatory?: boolean
          position?: number
          schedule_id: string
        }
        Update: {
          amount?: number
          id?: string
          label?: string
          mandatory?: boolean
          position?: number
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_items_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "fee_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_schedule_levels: {
        Row: {
          level_id: string
          schedule_id: string
        }
        Insert: {
          level_id: string
          schedule_id: string
        }
        Update: {
          level_id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_schedule_levels_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_schedule_levels_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "fee_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_schedules: {
        Row: {
          academic_year_id: string | null
          created_at: string
          id: string
          label: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string
          id?: string
          label: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string
          id?: string
          label?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_schedules_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_history: {
        Row: {
          author_id: string | null
          changed_at: string
          evaluation_id: string
          id: string
          new_score: number | null
          new_value: string | null
          previous_score: number | null
          previous_value: string | null
          reason: string
          student_id: string
          tenant_id: string
        }
        Insert: {
          author_id?: string | null
          changed_at?: string
          evaluation_id: string
          id?: string
          new_score?: number | null
          new_value?: string | null
          previous_score?: number | null
          previous_value?: string | null
          reason: string
          student_id: string
          tenant_id: string
        }
        Update: {
          author_id?: string | null
          changed_at?: string
          evaluation_id?: string
          id?: string
          new_score?: number | null
          new_value?: string | null
          previous_score?: number | null
          previous_value?: string | null
          reason?: string
          student_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_history_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          comment: string
          created_at: string
          evaluation_id: string
          score: number | null
          student_id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          comment?: string
          created_at?: string
          evaluation_id: string
          score?: number | null
          student_id: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          comment?: string
          created_at?: string
          evaluation_id?: string
          score?: number | null
          student_id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_links: {
        Row: {
          can_pick_up: boolean
          created_at: string
          guardian_id: string
          id: string
          is_primary: boolean
          relation: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          can_pick_up?: boolean
          created_at?: string
          guardian_id: string
          id?: string
          is_primary?: boolean
          relation?: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          can_pick_up?: boolean
          created_at?: string
          guardian_id?: string
          id?: string
          is_primary?: boolean
          relation?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_links_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_links_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          address: string
          alt_phone: string
          created_at: string
          email: string
          first_name: string
          id: string
          id_document: string
          last_name: string
          notes: string
          phone: string
          profession: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string
          alt_phone?: string
          created_at?: string
          email?: string
          first_name: string
          id?: string
          id_document?: string
          last_name: string
          notes?: string
          phone?: string
          profession?: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          alt_phone?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          id_document?: string
          last_name?: string
          notes?: string
          phone?: string
          profession?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          amount: number
          id: string
          invoice_id: string
          label: string
          position: number
        }
        Insert: {
          amount: number
          id?: string
          invoice_id: string
          label: string
          position?: number
        }
        Update: {
          amount?: number
          id?: string
          invoice_id?: string
          label?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year_id: string | null
          created_at: string
          due_date: string | null
          id: string
          installment_label: string
          issued_at: string
          note: string
          number: string
          status: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          installment_label?: string
          issued_at?: string
          note?: string
          number: string
          status?: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          installment_label?: string
          issued_at?: string
          note?: string
          number?: string
          status?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          code: string
          created_at: string
          cycle: string
          id: string
          label: string
          position: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          cycle: string
          id?: string
          label: string
          position?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          cycle?: string
          id?: string
          label?: string
          position?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "levels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string
          invited_by: string | null
          role_id: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role_id: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string
          invited_by?: string | null
          role_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json
          author_id: string
          body: string
          conversation_id: string
          id: string
          sent_at: string
        }
        Insert: {
          attachments?: Json
          author_id: string
          body: string
          conversation_id: string
          id?: string
          sent_at?: string
        }
        Update: {
          attachments?: Json
          author_id?: string
          body?: string
          conversation_id?: string
          id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          href: string
          id: string
          kind: string
          read_at: string | null
          tenant_id: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          href?: string
          id?: string
          kind: string
          read_at?: string | null
          tenant_id: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          href?: string
          id?: string
          kind?: string
          read_at?: string | null
          tenant_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          id: string
          invoice_id: string
          method: string
          note: string
          provider_reference: string
          received_at: string
          recorded_by: string | null
          reference: string
          status: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          invoice_id: string
          method: string
          note?: string
          provider_reference?: string
          received_at?: string
          recorded_by?: string | null
          reference: string
          status?: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          invoice_id?: string
          method?: string
          note?: string
          provider_reference?: string
          received_at?: string
          recorded_by?: string | null
          reference?: string
          status?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          academic_year_id: string
          created_at: string
          cycles: unknown[]
          end_date: string | null
          id: string
          kind: string
          label: string
          position: number
          start_date: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          cycles?: unknown[]
          end_date?: string | null
          id?: string
          kind: string
          label: string
          position?: number
          start_date?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          cycles?: unknown[]
          end_date?: string | null
          id?: string
          kind?: string
          label?: string
          position?: number
          start_date?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periods_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          domain: string
          key: string
          label: string
        }
        Insert: {
          domain: string
          key: string
          label: string
        }
        Update: {
          domain?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      report_cards: {
        Row: {
          academic_year_id: string | null
          class_id: string
          council_comment: string
          created_at: string
          generated_at: string | null
          id: string
          period_id: string | null
          published_at: string | null
          signature_override: Json | null
          snapshot: Json | null
          status: string
          student_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          class_id: string
          council_comment?: string
          created_at?: string
          generated_at?: string | null
          id?: string
          period_id?: string | null
          published_at?: string | null
          signature_override?: Json | null
          snapshot?: Json | null
          status?: string
          student_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          class_id?: string
          council_comment?: string
          created_at?: string
          generated_at?: string | null
          id?: string
          period_id?: string | null
          published_at?: string | null
          signature_override?: Json | null
          snapshot?: Json | null
          status?: string
          student_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_key: string
          role_id: string
        }
        Insert: {
          permission_key: string
          role_id: string
        }
        Update: {
          permission_key?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          id: string
          is_system: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_system?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_system?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          created_at: string
          image: Json
          signer_name: string
          signer_role: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          image?: Json
          signer_name?: string
          signer_role?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          image?: Json
          signer_name?: string
          signer_role?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signatures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          id: string
          name: string
          size_bytes: number
          storage_path: string
          student_id: string
          tenant_id: string
          type: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          name: string
          size_bytes?: number
          storage_path?: string
          student_id: string
          tenant_id: string
          type?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          size_bytes?: number
          storage_path?: string
          student_id?: string
          tenant_id?: string
          type?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          academic_year_id: string | null
          address: string
          birth_date: string | null
          birth_place: string
          class_id: string | null
          created_at: string
          filiere: string
          first_name: string
          gender: string
          id: string
          is_draft: boolean
          last_name: string
          level_id: string | null
          matricule: string
          medical_info: string
          nationality: string
          parcours: string
          photo_url: string
          previous_school: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          academic_year_id?: string | null
          address?: string
          birth_date?: string | null
          birth_place?: string
          class_id?: string | null
          created_at?: string
          filiere?: string
          first_name: string
          gender: string
          id?: string
          is_draft?: boolean
          last_name: string
          level_id?: string | null
          matricule: string
          medical_info?: string
          nationality?: string
          parcours?: string
          photo_url?: string
          previous_school?: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          academic_year_id?: string | null
          address?: string
          birth_date?: string | null
          birth_place?: string
          class_id?: string | null
          created_at?: string
          filiere?: string
          first_name?: string
          gender?: string
          id?: string
          is_draft?: boolean
          last_name?: string
          level_id?: string | null
          matricule?: string
          medical_info?: string
          nationality?: string
          parcours?: string
          photo_url?: string
          previous_school?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_levels: {
        Row: {
          level_id: string
          subject_id: string
        }
        Insert: {
          level_id: string
          subject_id: string
        }
        Update: {
          level_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_levels_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_levels_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          cycle: string
          description: string
          ects_credits: number
          ecue: string
          filiere: string
          id: string
          name: string
          semester: string
          status: string
          tenant_id: string
          ue: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          cycle: string
          description?: string
          ects_credits?: number
          ecue?: string
          filiere?: string
          id?: string
          name: string
          semester?: string
          status?: string
          tenant_id: string
          ue?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          cycle?: string
          description?: string
          ects_credits?: number
          ecue?: string
          filiere?: string
          id?: string
          name?: string
          semester?: string
          status?: string
          tenant_id?: string
          ue?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string
          contract_type: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          matricule: string
          notes: string
          phone: string
          photo_url: string
          start_date: string | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string
          contract_type?: string
          created_at?: string
          email?: string
          first_name: string
          id?: string
          last_name: string
          matricule: string
          notes?: string
          phone?: string
          photo_url?: string
          start_date?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          contract_type?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          matricule?: string
          notes?: string
          phone?: string
          photo_url?: string
          start_date?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          city: string
          country: string
          created_at: string
          currency: string
          id: string
          logo: string
          name: string
          settings: Json
          short_name: string
          slug: string
          status: string
          timezone: string
          type: string
          updated_at: string
        }
        Insert: {
          city?: string
          country?: string
          created_at?: string
          currency?: string
          id?: string
          logo?: string
          name: string
          settings?: Json
          short_name?: string
          slug: string
          status?: string
          timezone?: string
          type?: string
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          currency?: string
          id?: string
          logo?: string
          name?: string
          settings?: Json
          short_name?: string
          slug?: string
          status?: string
          timezone?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      correct_grade: {
        Args: {
          p_evaluation_id: string
          p_reason: string
          p_score: number
          p_student_id: string
          p_value: string
        }
        Returns: undefined
      }
      my_permissions: { Args: { p_tenant_id: string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
