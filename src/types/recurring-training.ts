export interface RecurringTraining {
  id: string
  name: string
  description: string
  day_of_week: number
  time: string
  location: string
  instructor?: string
  max_personnel?: number
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface RecurringTrainingInstance {
  id: string
  recurring_training_id: string
  training_id: string
  scheduled_date: string
  created_at: string
}

export interface CreateRecurringTrainingData {
  name: string
  description: string
  dayOfWeek: number
  time: string
  location: string
  instructor?: string
  maxPersonnel?: number
}

export interface UpdateRecurringTrainingData {
  name?: string
  description?: string
  dayOfWeek?: number
  time?: string
  location?: string
  instructor?: string
  maxPersonnel?: number
  isActive?: boolean
}

export interface RecurringTrainingWithStats extends RecurringTraining {
  instances_created: number
  created_by_name: string
  dayName: string
}

export interface ProcessingResult {
  recurringId: string
  name: string
  trainingId?: string
  scheduledDate?: string
  status: "created" | "skipped" | "error"
  reason?: string
  error?: string
  rescheduled?: boolean
  weekOffset?: number
}
