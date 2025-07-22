
export interface UserProfile {
  full_name: string;
  bio: string;
  country: string;
  education_level: string;
  field_of_study: string;
  years_of_experience: number;
  email_notifications: boolean;
  push_notifications: boolean;
  cookie_accepted?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface UserPreference {
  category_id: string;
  priority_level: number;
  is_interested: boolean;
}
