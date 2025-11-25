// app/api/admin/visits/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Reuse the same schema as the public route (visit creation)
const createVisitSchema = z.object({
    visitor: z.object({
        full_name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        phone: z.string().optional(),
        company: z.string().optional(),
        designation: z.string().optional(),
    }),
    visit: z.object({
        branch_id: z.string().uuid(),
        host_employee_id: z.string().uuid(),
        purpose: z.string().min(1, 'Purpose is required'),
        purpose_other: z.string().optional(),
        validity_hours: z.number().int().positive(),
        scheduled_start_at: z.string().min(1, 'Schedule time required'),
        additional_visitor_count: z.number().int().min(0).default(0),
        additional_visitor_names: z.string().optional(),
    }),
});

export async function POST(request: Request) {
    try {
        // Only admin users should hit this endpoint – we rely on Supabase auth session
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = createVisitSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { visitor, visit } = validation.data;

        // Use service‑role client to bypass RLS for inserts
        const { createServiceClient } = await import('@/lib/supabase/service');
        const adminSupabase = createServiceClient();

        // 1. Get organization (single‑org assumption)
        const { data: org } = await adminSupabase.from('organizations').select('id').limit(1).maybeSingle();
        if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 500 });
        const organization_id = org.id;

        // 2. Upsert visitor (same logic as public route)
        let visitorId: string;
        const { data: existingVisitor } = await adminSupabase
            .from('visitors')
            .select('id')
            .eq('organization_id', organization_id)
            .eq('email', visitor.email)
            .maybeSingle();
        if (existingVisitor) {
            visitorId = existingVisitor.id;
            await adminSupabase.from('visitors').update({
                full_name: visitor.full_name,
                phone: visitor.phone,
                company: visitor.company,
                designation: visitor.designation,
            }).eq('id', visitorId);
        } else {
            const { data: newVisitor, error: createError } = await adminSupabase
                .from('visitors')
                .insert({
                    organization_id,
                    email: visitor.email,
                    full_name: visitor.full_name,
                    phone: visitor.phone,
                    company: visitor.company,
                    designation: visitor.designation,
                })
                .select()
                .single();
            if (createError) throw createError;
            visitorId = newVisitor.id;
        }

        // 3. Determine config
        const { data: orgConfig } = await adminSupabase
            .from('organization_config')
            .select('*')
            .eq('organization_id', organization_id)
            .maybeSingle();

        const { data: host } = await adminSupabase
            .from('employees')
            .select('requires_host_approval')
            .eq('id', visit.host_employee_id)
            .maybeSingle();

        const approvalRequired = orgConfig?.approval_required || host?.requires_host_approval || false;
        const status = approvalRequired ? 'PENDING_APPROVAL' : 'APPROVED';

        // 4. Insert visit
        const { data: newVisit, error: visitError } = await adminSupabase
            .from('visits')
            .insert({
                organization_id,
                branch_id: visit.branch_id,
                visitor_id: visitorId,
                host_employee_id: visit.host_employee_id,
                purpose: visit.purpose,
                purpose_other: visit.purpose_other,
                validity_hours: visit.validity_hours,
                scheduled_start_at: visit.scheduled_start_at,
                status,
                requires_host_approval: approvalRequired,
                email_verification_required: false,
                additional_visitor_count: visit.additional_visitor_count,
                additional_visitor_names: visit.additional_visitor_names,
            })
            .select()
            .single();
        if (visitError) throw visitError;

        return NextResponse.json({ visit: newVisit });
    } catch (error: any) {
        console.error('Admin visit creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
