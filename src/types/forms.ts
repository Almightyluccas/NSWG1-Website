export interface Form {
  id: string
  name: string
  description?: string
  type: "submission" | "link" | "pdf"
  status: "active" | "inactive" | "draft"
  url?: string
  fields?: FormField[]
  created_at: Date
  updated_at: Date
  created_by?: string
}

export interface FormField {
  id: string
  name: string
  label: string
  type: "text" | "textarea" | "date" | "select" | "radio" | "checkbox"
  required: boolean
  placeholder?: string
  defaultValue?: string
  options?: string[]
}

export interface FormSubmission {
  id: string
  form_id: string
  user_id: string
  user_name?: string
  data: Record<string, any>
  status: "pending" | "approved" | "denied"
  reviewed_by?: string
  reviewed_at?: Date
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface LOASubmission {
  name: string
  reason: string
  dateOfLeave?: string
  dateOfReturn?: string
}
