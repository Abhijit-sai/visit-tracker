-- Add new values to visit_status enum
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'CHECKED_IN';
ALTER TYPE visit_status ADD VALUE IF NOT EXISTS 'CHECKED_OUT';
