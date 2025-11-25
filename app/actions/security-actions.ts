'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function checkInVisitor(visitId: string) {
    // Use service role to bypass RLS for public kiosk updates
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
        .from('visits')
        .update({
            status: 'CHECKED_IN',
            checkin_at: new Date().toISOString(),
        })
        .eq('id', visitId)

    if (error) {
        console.error('Check-in error:', error)
        throw new Error('Failed to check in visitor')
    }

    revalidatePath('/security')
}

export async function checkOutVisitor(visitId: string) {
    // Use service role to bypass RLS for public kiosk updates
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase
        .from('visits')
        .update({
            status: 'CHECKED_OUT',
            checkout_at: new Date().toISOString(),
        })
        .eq('id', visitId)

    if (error) {
        console.error('Check-out error:', error)
        throw new Error('Failed to check out visitor')
    }

    revalidatePath('/security')
}
