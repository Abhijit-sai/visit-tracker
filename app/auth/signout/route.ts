import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Sign out
    await supabase.auth.signOut()

    // Redirect to login page
    return NextResponse.redirect(new URL('/admin/login', request.url))
}
