'use server'

import { createClient } from '@/lib/supabase/server'

export async function verifyPassword(password: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { success: false, error: 'User not found' }
    }

    // Verify password by attempting to sign in
    const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
    })

    if (error) {
        return { success: false, error: 'Invalid password' }
    }

    return { success: true }
}
