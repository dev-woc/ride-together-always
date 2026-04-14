-- Cycle of Support schema

CREATE TABLE IF NOT EXISTS cos_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cos_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES cos_users(id) ON DELETE CASCADE,

  -- Personal Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  city_state TEXT NOT NULL,

  -- Therapy Background
  prior_therapy BOOLEAN NOT NULL,
  has_insurance BOOLEAN NOT NULL,
  current_challenges TEXT[] NOT NULL DEFAULT '{}',

  -- Mental Health & Goals
  mental_health_description TEXT NOT NULL,
  therapy_motivation TEXT NOT NULL,
  therapy_goals TEXT NOT NULL,
  therapy_barriers TEXT NOT NULL,

  -- Logistics
  weekly_commitment BOOLEAN NOT NULL,
  has_device BOOLEAN NOT NULL,
  testimonial_willing BOOLEAN NOT NULL,

  -- Therapist Preference
  therapist_preference TEXT NOT NULL,
  preferred_therapist_name TEXT,
  preferred_therapist_contact TEXT,

  -- Video
  intro_video_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',

  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cos_applications_user_id_idx ON cos_applications(user_id);
CREATE INDEX IF NOT EXISTS cos_applications_status_idx ON cos_applications(status);
