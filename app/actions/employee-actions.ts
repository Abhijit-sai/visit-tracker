'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const employeeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    designation: z.string().optional(),
    phone: z.string().optional(),
    branch_id: z.string().uuid('Branch is required'),
    requires_host_approval: z.boolean().optional(),
})

export async function createEmployee(formData: FormData) {
    const supabase = await createClient()

    // Get Organization ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: admin } = await supabase.from('admins').select('organization_id').eq('auth_user_id', user.id).single()
    if (!admin) throw new Error('Admin not found')

    const rawData = {
        name: formData.get('name'),
        email: formData.get('email'),
        designation: formData.get('designation'),
        phone: formData.get('phone'),
        branch_id: formData.get('branch_id'),
        requires_host_approval: formData.get('requires_host_approval') === 'on',
    }

    const validation = employeeSchema.safeParse(rawData)
    if (!validation.success) {
        throw new Error('Validation failed')
    }

    const { error } = await supabase.from('employees').insert({
        ...validation.data,
        organization_id: admin.organization_id,
    })

    if (error) throw error

    revalidatePath('/admin/employees')
    redirect('/admin/employees')
}

export async function deleteEmployee(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('employees')
        .update({ is_active: false }) // Soft delete
        .eq('id', id)

    if (error) throw error
    revalidatePath('/admin/employees')
}
