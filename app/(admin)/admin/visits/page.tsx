import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { VisitStatusBadge } from '@/components/VisitStatusBadge'
import { format } from 'date-fns'
import { VisitFilters } from '@/components/VisitFilters'

export default async function VisitsPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const supabase = await createClient()

    // Basic filtering (can be expanded)
    const params = await searchParams
    const status = typeof params.status === 'string' ? params.status : null
    const search = typeof params.search === 'string' ? params.search : null
    const branchId = typeof params.branchId === 'string' ? params.branchId : null
    const startDate = typeof params.startDate === 'string' ? params.startDate : null
    const endDate = typeof params.endDate === 'string' ? params.endDate : null

    // Fetch branches for filter
    const { data: branches } = await supabase.from('branches').select('id, name').order('name')

    let query = supabase
        .from('visits')
        .select(`
      *,
      visitor:visitors!inner(full_name, company),
      host:employees(name),
      branch:branches(name)
    `)
        .order('created_at', { ascending: false })

    if (status) {
        query = query.eq('status', status)
    }

    if (branchId) {
        query = query.eq('branch_id', branchId)
    }

    if (startDate) {
        query = query.gte('scheduled_start_at', `${startDate}T00:00:00`)
    }

    if (endDate) {
        query = query.lte('scheduled_start_at', `${endDate}T23:59:59`)
    }

    if (search) {
        // Search in visitor name or company
        // Note: This requires the !inner join on visitors to filter by related table
        query = query.ilike('visitor.full_name', `%${search}%`)
    }

    const { data: visits, error } = await query

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
                <div className="flex gap-2">
                    {/* Create Visit button */}
                    <Link href="/admin/visits/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">Create Visit</Link>
                </div>
            </div>

            {/* Filters */}
            <VisitFilters branches={branches || []} />

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {visits?.map((visit: any) => (
                            <tr key={visit.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{visit.visitor?.full_name}</div>
                                    <div className="text-sm text-gray-500">{visit.visitor?.company}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {visit.host?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {visit.branch?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(visit.scheduled_start_at), 'MMM d, h:mm a')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <VisitStatusBadge status={visit.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/visits/${visit.id}`} className="text-black hover:text-gray-600">
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {(!visits || visits.length === 0) && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No visits found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
