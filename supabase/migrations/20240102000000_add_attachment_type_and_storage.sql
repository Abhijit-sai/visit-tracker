-- Add 'OTHER' to attachment_type enum
ALTER TYPE attachment_type ADD VALUE IF NOT EXISTS 'OTHER';

-- Create storage bucket for visit attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-attachments', 'visit-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies

-- Allow public read access to visit attachments
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'visit-attachments' );

-- Allow authenticated uploads (Admins/Kiosk)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'visit-attachments' );

-- Allow admins to update/delete
CREATE POLICY "Admin Manage"
ON storage.objects FOR ALL
USING ( bucket_id = 'visit-attachments' AND auth.role() = 'authenticated' );
