-- Seed Data

-- 1. Organization
insert into organizations (id, name, slug)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Corp', 'acme-corp')
on conflict do nothing;

-- 2. Branches
insert into branches (id, organization_id, name, code, address)
values
  ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Headquarters', 'HQ', '123 Main St, Tech City'),
  ('b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Branch Office', 'BR-1', '456 Side Ave, Innovation Park')
on conflict do nothing;

-- 3. Admin User (Note: This creates the DB record, but the Auth User must exist in Supabase Auth)
-- You will need to create a user in Supabase Auth with this email manually or via script,
-- and then update the auth_user_id here if you want to link them properly for RLS testing.
-- For now, we insert a placeholder or you can update this after creating the user.
insert into admins (id, organization_id, name, email, role)
values
  ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380c44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'System Admin', 'admin@acme.com', 'ADMIN')
on conflict do nothing;

-- 4. Organization Config
insert into organization_config (organization_id, approval_required, approval_recipient, email_verification_required, allow_manual_walkin)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true, 'HOST', true, true)
on conflict do nothing;

-- 5. Field Config
insert into field_config (organization_id, field_key, is_visible, is_required)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'visitor.company', true, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'visitor.designation', true, false),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'visitor.phone', true, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'visitor.photo', true, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'visit.purpose_other', true, false)
on conflict do nothing;

-- 6. Email Templates
insert into email_templates (organization_id, type, subject, body)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VISITOR_VERIFICATION', 'Verify your visit to {{branch_name}}', 'Hi {{visitor_name}}, please verify your email by clicking here: {{verification_link}}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'HOST_APPROVAL_REQUEST', 'Visitor Approval Request: {{visitor_name}}', 'Hi {{host_name}}, {{visitor_name}} from {{visitor_company}} wants to visit you. Approve: {{approve_link}} | Decline: {{decline_link}}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VISIT_APPROVED_VISITOR', 'Visit Approved', 'Hi {{visitor_name}}, your visit to {{branch_name}} is approved. You can check status here: {{status_page_url}}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'VISIT_DECLINED_VISITOR', 'Visit Declined', 'Hi {{visitor_name}}, unfortunately your visit to {{branch_name}} was declined.')
on conflict do nothing;

-- 7. Employees (Hosts)
insert into employees (organization_id, branch_id, name, designation, email, requires_host_approval)
values
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Alice Host', 'Manager', 'alice@acme.com', false),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Bob Security', 'Security Head', 'bob@acme.com', true)
on conflict do nothing;
