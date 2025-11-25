import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function KioskLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/visit/login')
    }

    // Check if user has KIOSK role
    console.log('Kiosk Layout Debug: Checking user', user.id, user.email)
    const { data: adminUser, error } = await supabase
        .from('admins')
        .select('role, auth_user_id, email')
        .eq('auth_user_id', user.id)
        .single()

    console.log('Kiosk Layout Debug: Admin query result', { adminUser, error })

    // Allow ADMIN or KIOSK roles
    if (!adminUser || (adminUser.role !== 'KIOSK' && adminUser.role !== 'ADMIN')) {
        // Redirect to unauthorized page to avoid login loops
        redirect('/unauthorized')
    }

    return <>{children}</>
}
