export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
  label: string;
}

export interface BaseRecord extends BaseEntity {
  user_id: number;
  document_id: number | null;
  author_id: number;
  text: string | null;
  document_parsed: null | string;
  document: null;
}

export interface BaseCreateRecord {
  user_id: number;
  document_id: number | null;
  author_id: number;
  text: string | null;
}

export interface Image extends BaseEntity {
  name: string | null;
  description: string | null;
  filename: string;
  model_type: string;
  model_id: number;
  path: string;
  image_url: string;
}


export interface Status extends BaseEntity {
  name: string;
  color: string;
  order: number;
}

export interface LeaveApplication  extends BaseEntity {
  form_id: number;
  user_id: number;
  first_name: string;
  email_address?: string;
  date_of_leave?: string;
  date_of_return?: string;
  reason_for_leave?: string;
  statuses: Array<Status>;
}

export interface Unit extends BaseEntity {
  name: string;
  description: string | null;
  empty: null;
  order: number;
  hidden: boolean;
  icon: string | null;
}

export interface Position extends BaseEntity {
  name: string;
  description: string | null;
  order: number;
}

export interface Specialty extends BaseEntity {
  name: string;
  abbreviation: string;
  description: string;
  order: number;
}

export interface Rank extends BaseEntity {
  name: string;
  description: string | null;
  abbreviation: string;
  paygrade: string;
  order: number;
  image?: Image;
}

export interface Award extends BaseEntity {
  name: string;
  description: string;
  order: number;
  image?: Image;
}

export interface CreateAwardRecord extends BaseCreateRecord{
  award_id: number;
}

export type CreateCombatRecord = BaseCreateRecord

export enum RankRecordType {
  Promotion = 0,
  Demotion = 1,
  Lateral = 2,
  Transfer = 3,
}
export interface CreateRankRecord extends BaseCreateRecord {
  rank_id: number;
  type: RankRecordType;
}

export interface CreateAssignmentRecord extends BaseCreateRecord {
  status_id: number | null;
  unit_id: number | null;
  position_id: number | null;
  specialty_id: number | null;
  type: 'primary' | 'secondary';
}

export interface CreateQualificationRecord extends BaseCreateRecord {
  qualification_id: number;
}

export interface UpdateUserUnit {
  user_id: number;
  unit_id: number;
  name: string;
}


export interface Qualification extends BaseEntity {
  name: string;
  description: string;
  order: number;
  image?: Image;
}

export interface AwardRecord extends BaseRecord {
  award_id: number;
}

export type CombatRecord = BaseRecord

export interface QualificationRecord extends BaseRecord {
  qualification_id: number;
}

export interface RankRecord extends BaseRecord {
  rank_id: number;
  type: number;
}

export interface AssignmentRecord extends BaseRecord {
  status_id: number;
  unit_id: number;
  position_id: number;
  specialty_id: number;
  unit_slot_id: number | null;
  type: string;
  author?: PerscomUserResponse;
  position?: Position;
  specialty?: Specialty;
  status?: Status;
  unit?: Unit;
  user?: PerscomUserResponse;
}

export interface CreatePerscomUser {
  name: string;
  email: string;
}

export interface PerscomUserResponse extends BaseEntity {
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
  no_fields: null;
  last_assignment_change_date: string;
  last_rank_change_date: string;
  online: boolean;
  profile_photo_url: string;
  cover_photo_url: string;
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
  specialty?: Specialty | null;
  status?: Status;
  unit?: Unit;
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

export interface ApplicationData extends ApplicationSubmission, BaseEntity {
  statuses?: Status[];
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

export interface PaginatedResponse<T> {
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