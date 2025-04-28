export interface CreatePerscomUser {
  name: string,
  email: string,
}

export interface PerscomUserResponse {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  phone_number: string | null;
  position_id: number;
  rank_id: number;
  specialty_id: number | null;
  status_id: number;
  unit_id: number;
  unit_slot_id: number | null;
  approved: boolean;
  notes: string | null;
  notes_updated_at: string | null;
  profile_photo: string | null;
  cover_photo: string;
  last_seen_at: string;
  discord_user_id: string | null;
  created_at: string;
  updated_at: string;
  no_fields: null;
  last_assignment_change_date: string;
  last_rank_change_date: string;
  online: boolean;
  profile_photo_url: string;
  cover_photo_url: string;
  label: string;
  assignment_records?: AssignmentRecord[];
  attachments?: [] | null;
  award_records?: AwardRecord[];
  combat_records?: CombatRecord[];
  fields?: [] | null;
  position?: Position;
  primary_assignment_records?: AssignmentRecord[];
  qualification_records?: QualificationRecord[];
  rank?: Rank;
  rank_records?: RankRecord[];
  secondary_assignment_records?: AssignmentRecord[];
  service_records?: [] | null;
  specialty?: [] | null;
  status?: Status;
  unit?: Unit;
}

export interface AssignmentRecord {
  id: number;
  user_id: number;
  status_id: number;
  unit_id: number;
  position_id: number;
  specialty_id: number;
  unit_slot_id: number | null;
  document_id: number | null;
  author_id: number | null;
  type: string;
  text: string | null;
  created_at: string;
  updated_at: string;
  document_parsed: null;
  label: string;
  document: null;
}

export interface AwardRecord {
  id: number;
  user_id: number;
  award_id: number;
  document_id: number | null;
  author_id: number;
  text: string | null;
  created_at: string;
  updated_at: string;
  document_parsed: null;
  label: string;
  document: null;
}

export interface CombatRecord {
  id: number;
  user_id: number;
  document_id: number | null;
  author_id: number;
  text: string | null;
  created_at: string;
  updated_at: string;
  document_parsed: null;
  label: string;
  document: null;
}

export interface QualificationRecord {
  id: number;
  user_id: number;
  qualification_id: number;
  document_id: number | null;
  author_id: number;
  text: string | null;
  created_at: string;
  updated_at: string;
  document_parsed: null;
  label: string;
  document: null;
}

export interface RankRecord {
  id: number;
  user_id: number;
  rank_id: number;
  document_id: number | null;
  author_id: number;
  text: string | null;
  type: number;
  created_at: string;
  updated_at: string;
  document_parsed: null;
  label: string;
  document: null;
}

export interface Position {
  id: number;
  name: string;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
  label: string;
}

export interface Rank {
  id: number;
  name: string;
  description: string | null;
  abbreviation: string;
  paygrade: string;
  order: number;
  created_at: string;
  updated_at: string;
  label: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
  label: string;
}

export interface Unit {
  id: number;
  name: string;
  description: string | null;
  empty: null;
  order: number;
  hidden: boolean;
  icon: string | null;
  created_at: string;
  updated_at: string;
  label: string;
}

export interface ApplicationSubmission {
  form_id: number;
  user_id: number;
  arma_3_id: string;
  first_name: string;
  discord_name: string;
  date_of_birth: string;
  email_address: string;
  previous_unit: string;
  preferred_position: string;
  what_is_your_time_zone: string;
  arma_experience_in_hours: number;
  why_do_you_want_to_join_red_squadron: string;
  what_makes_you_more_capable_than_other_candidates: string;
  confirm_you_have_read_and_understand_the_recruitment_requirements_on_our_website: string;
}

export interface PaginatedResponse <T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ApplicationData {
  id: number;
  form_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  arma_3_id: string;
  first_name: string;
  discord_name: string;
  date_of_birth: string;
  email_address: string;
  previous_unit: string;
  preferred_position: string;
  what_is_your_time_zone: string;
  arma_experience_in_hours: number;
  why_do_you_want_to_join_red_squadron: string;
  what_makes_you_more_capable_than_other_candidates: string;
  confirm_you_have_read_and_understand_the_recruitment_requirements_on_our_website: string;
  label: string;
  statuses?: StatusData[];
}

export interface StatusData {
  id: number;
  name: string;
  color: string;
  order: number;
  created_at: string;
  updated_at: string;
  label: string;
}

export interface ApplicationSubmissionResponse {
  data: {
    id: number;
    form_id: number;
    user_id: number;
    label: string;
    created_at: string;
    updated_at: string;
  }
}