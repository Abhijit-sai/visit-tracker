import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { format } from 'date-fns'

export async function GET() {
    const supabase = await createClient()

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch Visits
    const { data: visits } = await supabase
        .from('visits')
        .select(`
      *,
      visitor:visitors(full_name, email, company, phone),
      host:employees(name),
      branch:branches(name)
    `)
        .order('created_at', { ascending: false })

    if (!visits) {
        return new NextResponse('No data', { status: 404 })
    }

    // Generate CSV
    const headers = ['Date', 'Visitor Name', 'Visitor Email', 'Company', 'Host', 'Branch', 'Purpose', 'Status', 'Check In', 'Check Out']
    const rows = visits.map((v: any) => [
        format(new Date(v.scheduled_start_at), 'yyyy-MM-dd HH:mm'),
        v.visitor?.full_name,
        v.visitor?.email,
        v.visitor?.company || '',
        v.host?.name,
        v.branch?.name,
        v.purpose,
        v.status,
        v.checkin_at ? format(new Date(v.checkin_at), 'HH:mm') : '',
        v.checkout_at ? format(new Date(v.checkout_at), 'HH:mm') : '',
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="visits-export-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
        },
    })
}
