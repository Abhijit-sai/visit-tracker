'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateVisitStatus(visitId: string, status: string, reason?: string) {
    const supabase = await createClient()

    // Get current admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get Admin ID
    const { data: admin } = await supabase.from('admins').select('id').eq('auth_user_id', user.id).single()
    if (!admin) throw new Error('Admin not found')

    // Get current status for history
    const { data: visit } = await supabase.from('visits').select('status').eq('id', visitId).single()
    if (!visit) throw new Error('Visit not found')

    // Update Visit
    const { error } = await supabase
        .from('visits')
        .update({
            status,
            status_reason: reason,
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw error

    // Log History
    await supabase.from('visit_status_history').insert({
        visit_id: visitId,
        from_status: visit.status,
        to_status: status,
        changed_by_type: 'ADMIN',
        changed_by_admin_id: admin.id,
        note: reason
    })

    revalidatePath(`/admin/visits/${visitId}`)
    revalidatePath('/admin/visits')
}

export async function checkInVisitor(visitId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('visits')
        .update({
            checkin_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw error
    revalidatePath(`/admin/visits/${visitId}`)
}

export async function checkOutVisitor(visitId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('visits')
        .update({
            checkout_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', visitId)

    if (error) throw error
    revalidatePath(`/admin/visits/${visitId}`)
}
