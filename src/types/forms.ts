export interface FormDefinition {
  id: number
  title: string
  description?: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  questions?: FormQuestion[]
}

export interface FormQuestion {
  id: number
  form_id: number
  question_text: string
  question_type:
    | "short_answer"
    | "paragraph"
    | "multiple_choice"
    | "checkboxes"
    | "dropdown"
    | "date"
    | "time"
    | "email"
    | "number"
  is_required: boolean
  options?: string[]
  order_index: number
  created_at: string
}

export interface FormSubmission {
  id: number
  form_id: number
  user_id?: string
  user_name?: string
  user_email?: string
  submitted_at: string | Date
  status: "pending" | "reviewed" | "approved" | "rejected"
  reviewed_by?: string
  reviewed_at?: Date
  notes?: string
  answers?: FormSubmissionAnswer[]
  form_title?: string
  form_description?: string
}

export interface FormSubmissionAnswer {
  question: FormQuestion
  id: number
  submission_id: number
  question_id: number
  answer_text?: string
  answer_json?: any
  created_at: string
  question_text?: string
  question_type?: string
}

export interface Document {
  id: number
  name: string
  description?: string
  file_path: string
  file_size?: number
  mime_type?: string
  created_by: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DocumentAccess {
  id: number
  document_path: string
  document_name: string
  user_id?: string
  user_name?: string
  access_type: "view" | "download"
  accessed_at: string
  ip_address?: string
  user_agent?: string
}

export interface DocumentInfo {
  name: string
  path: string
  type: string
  size?: number
  lastModified?: string
}

export interface DocumentAccessLog {
  id: number
  document_path: string
  document_name: string
  user_id?: string
  user_name?: string
  access_type: "view" | "download"
  accessed_at: string
  ip_address?: string
  user_agent?: string
}

export interface RawSubmissionQueryResult {
  submission_id: number;
  form_id: number;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  submitted_at: Date;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: Date | null;
  notes: string | null;
  form_title: string;
  form_description: string | null;
  question_id: number | null;
  question_text: string | null;
  question_type: FormQuestion['question_type'] | null;
  is_required: boolean | null;
  options: string | null;
  order_index: number | null;
  answer_id: number | null;
  answer_text: string | null;
  answer_json: string | null;
}