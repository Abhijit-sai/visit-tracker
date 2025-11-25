'use server'

import { createClient } from '@supabase/supabase-js'

export async function uploadVisitorPhoto(formData: FormData) {
    const file = formData.get('file') as File
    const visitId = formData.get('visitId') as string
    const visitorId = formData.get('visitorId') as string
    const organizationId = formData.get('organizationId') as string

    if (!file || !visitId || !visitorId || !organizationId) {
        throw new Error('Missing required fields')
    }

    // Initialize Service Role Client to bypass RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Upload to Storage
    const fileExt = 'jpg' // Assuming JPEG from canvas
    const fileName = `${visitId}/visitor_photo.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
        .from('visit-attachments') // Use the same bucket we created
        .upload(fileName, fileBuffer, {
            contentType: 'image/jpeg',
            upsert: true
        })

    if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload photo')
    }

    // 2. Insert into Attachments table
    const { error: dbError } = await supabaseAdmin
        .from('attachments')
        .insert({
            organization_id: organizationId,
            visit_id: visitId,
            visitor_id: visitorId,
            type: 'VISITOR_PHOTO',
            storage_path: fileName,
        })

    if (dbError) {
        console.error('Database error:', dbError)
        throw new Error('Failed to save attachment record')
    }

    return { success: true }
}
