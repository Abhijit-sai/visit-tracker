'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function uploadVisitDocument(formData: FormData) {
    const supabase = await createClient()

    const file = formData.get('file') as File
    const visitId = formData.get('visitId') as string
    const visitorId = formData.get('visitorId') as string
    const type = formData.get('type') as string

    if (!file || !visitId || !visitorId || !type) {
        throw new Error('Missing required fields')
    }

    // 1. Get Organization ID & Verify Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: admin } = await supabase.from('admins').select('organization_id').eq('auth_user_id', user.id).single()
    if (!admin) throw new Error('Admin not found')

    // Initialize Service Role Client to bypass RLS for Storage (since policies might be missing)
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. Upload to Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${visitId}/${Date.now()}.${fileExt}`

    // Convert File to ArrayBuffer for Supabase JS client
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
        .from('visit-attachments')
        .upload(fileName, fileBuffer, {
            contentType: file.type,
            upsert: true
        })

    if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload file')
    }

    // 3. Insert into Attachments table
    const { error: dbError } = await supabaseAdmin
        .from('attachments')
        .insert({
            organization_id: admin.organization_id,
            visit_id: visitId,
            visitor_id: visitorId,
            type: type,
            storage_path: fileName,
        })

    if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save attachment record')
    }

    revalidatePath(`/admin/visits/${visitId}`)
    return { success: true }
}
