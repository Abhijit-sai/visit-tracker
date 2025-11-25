import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let adminByAuthId = null
    let adminByEmail = null
    let allAdmins = null

    if (user) {
        // Check by ID
        const { data: byId } = await supabase
            .from('admins')
            .select('*')
            .eq('auth_user_id', user.id)
            .single()
        adminByAuthId = byId

        // Check by Email
        const { data: byEmail } = await supabase
            .from('admins')
            .select('*')
            .eq('email', user.email)
            .single()
        adminByEmail = byEmail
    }

    // Get all admins just to see what's there (careful with privacy, but this is debug)
    const { data: admins } = await supabase.from('admins').select('email, role, auth_user_id')
    allAdmins = admins

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Debug Info</h1>

            <section className="mb-8">
                <h2 className="font-bold text-blue-600">Current Auth User</h2>
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </section>

            <section className="mb-8">
                <h2 className="font-bold text-green-600">Admin Record (Found by Auth ID)</h2>
                <p className="text-gray-500">This is what the Layout checks for.</p>
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(adminByAuthId, null, 2)}
                </pre>
            </section>

            <section className="mb-8">
                <h2 className="font-bold text-orange-600">Admin Record (Found by Email)</h2>
                <p className="text-gray-500">This is what we tried to link to.</p>
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(adminByEmail, null, 2)}
                </pre>
            </section>

            <section className="mb-8">
                <h2 className="font-bold text-purple-600">All Admins Table</h2>
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(allAdmins, null, 2)}
                </pre>
            </section>
        </div>
    )
}
