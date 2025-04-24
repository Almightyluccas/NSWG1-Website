export interface CreatePerscomUser {
  name: string,
  email: string,
}

export interface PerscomUserResponse {
  data: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    phone_number: string | null;
    position_id: number | null;
    rank_id: number | null;
    specialty_id: number | null;
    status_id: number | null;
    unit_id: number | null;
    unit_slot_id: number | null;
    approved: boolean;
    notes: string | null;
    notes_updated_at: string | null;
    profile_photo: string | null;
    cover_photo: string | null;
    last_seen_at: string | null;
    discord_user_id: string | null;
    created_at: string;
    updated_at: string;
    last_assignment_change_date: string | null;
    last_rank_change_date: string | null;
    online: boolean;
    profile_photo_url: string;
    cover_photo_url: string | null;
    label: string;
  }
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