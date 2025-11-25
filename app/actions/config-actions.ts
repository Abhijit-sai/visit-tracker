'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrgConfig(formData: FormData) {
    const supabase = await createClient()

    // Get Org ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: admin } = await supabase.from('admins').select('organization_id').eq('auth_user_id', user.id).single()
    if (!admin) throw new Error('Admin not found')

    const config = {
        approval_required: formData.get('approval_required') === 'on',
        email_verification_required: formData.get('email_verification_required') === 'on',
        allow_manual_walkin: formData.get('allow_manual_walkin') === 'on',
        approval_recipient: formData.get('approval_recipient'),
        auto_cancel_incomplete_after_hours: Number(formData.get('auto_cancel_incomplete_after_hours')),
    }

    const { error } = await supabase
        .from('organization_config')
        .update(config)
        .eq('organization_id', admin.organization_id)

    if (error) throw error
    revalidatePath('/admin/config')
}

export async function updateFieldConfig(formData: FormData) {
    const supabase = await createClient()

    // Get Org ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: admin } = await supabase.from('admins').select('organization_id').eq('auth_user_id', user.id).single()
    if (!admin) throw new Error('Admin not found')

    // We expect fields like "visitor.company_visible", "visitor.company_required"
    const updates = []

    // Helper to extract field updates
    const fields = ['visitor.company', 'visitor.designation', 'visitor.phone', 'visitor.photo', 'visit.purpose_other']

    for (const field of fields) {
        const is_visible = formData.get(`${field}_visible`) === 'on'
        const is_required = formData.get(`${field}_required`) === 'on'

        updates.push(
            supabase
                .from('field_config')
                .upsert({
                    organization_id: admin.organization_id,
                    field_key: field,
                    is_visible,
                    is_required
                }, { onConflict: 'organization_id, field_key' })
        )
    }

    await Promise.all(updates)
    revalidatePath('/admin/config')
}
