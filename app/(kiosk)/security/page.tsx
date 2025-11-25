import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { VisitStatusBadge } from '@/components/VisitStatusBadge'
import { SecurityVisitActions } from './SecurityVisitActions'
import { BranchSelector } from './BranchSelector'
import { ArrowLeft, Building2 } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function SecurityPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    const supabase = await createClient()
    const params = await searchParams

    // 1. Get Branches
    const { data: branches } = await supabase
        .from('branches')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

    if (!branches || branches.length === 0) {
        return <div className="p-8 text-center">No active branches found.</div>
    }

    // Determine selected branch
    let selectedBranchId = typeof params.branchId === 'string' ? params.branchId : null

    // If no branch selected, redirect to the first one to simplify the view
    if (!selectedBranchId && branches.length > 0) {
        redirect(`/security?branchId=${branches[0].id}`)
    }

    const selectedBranch = branches.find(b => b.id === selectedBranchId)

    // 2. Get Today's Visits for the selected branch
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    const { data: visits } = await supabase
        .from('visits')
        .select(`
            *,
            visitor:visitors(full_name, company),
            host:employees(name)
        `)
        .eq('branch_id', selectedBranchId)
        .gte('scheduled_start_at', startOfDay)
        .lte('scheduled_start_at', endOfDay)
        .order('scheduled_start_at', { ascending: true })

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/visit" className="text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Scheduled Visits
                        </h1>
                        <Link
                            href="/visit/new"
                            className="ml-4 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Start New Visit
                        </Link>
                    </div>

                    {/* Branch Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Location:</span>
                        <div className="relative">
                            <BranchSelector branches={branches} selectedBranchId={selectedBranchId} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        Visits for {format(new Date(), 'MMMM d, yyyy')} - {selectedBranch?.name}
                    </h2>
                </div>

                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {visits?.map((visit: any) => (
                                <tr key={visit.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {format(new Date(visit.scheduled_start_at), 'h:mm a')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{visit.visitor?.full_name}</div>
                                        <div className="text-sm text-gray-500">{visit.visitor?.company}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {visit.host?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <VisitStatusBadge status={visit.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <SecurityVisitActions visit={visit} />
                                    </td>
                                </tr>
                            ))}
                            {(!visits || visits.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No visits scheduled for today.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
