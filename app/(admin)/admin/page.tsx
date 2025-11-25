import { createClient } from '@/lib/supabase/server'
import { Users, Clock, CheckCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { VisitStatusBadge } from '@/components/VisitStatusBadge'


export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch stats
    const { count: visitsToday } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_start_at', new Date().toISOString().split('T')[0])

    const { count: pendingApprovals } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING_APPROVAL')

    const { count: activeVisits } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .not('checkin_at', 'is', null)
        .is('checkout_at', null)

    // Fetch recent visits
    const { data: recentVisits } = await supabase
        .from('visits')
        .select(`
            *,
            visitor:visitors(full_name, email),
            host:employees!visits_host_employee_id_fkey(name),
            branch:branches(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    const stats = [
        {
            label: 'Visits Today',
            value: visitsToday || 0,
            icon: Users,
            color: 'indigo',
            bgColor: 'bg-indigo-50',
            iconColor: 'text-indigo-600'
        },
        {
            label: 'Pending Approvals',
            value: pendingApprovals || 0,
            icon: Clock,
            color: 'amber',
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600'
        },
        {
            label: 'Active Now',
            value: activeVisits || 0,
            icon: CheckCircle,
            color: 'green',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="stat-card">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="stat-card-label">{stat.label}</p>
                                    <p className="stat-card-value mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Visits */}
            <div className="card">
                <div className="card-header flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Latest visitor activity</p>
                    </div>
                    <Link href="/admin/visits" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                        View all →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    {recentVisits && recentVisits.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Visitor</th>
                                    <th>Host</th>
                                    <th>Branch</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentVisits.map((visit: any) => (
                                    <tr key={visit.id}>
                                        <td>
                                            <div>
                                                <p className="font-medium text-gray-900">{visit.visitor?.full_name}</p>
                                                <p className="text-sm text-gray-500">{visit.visitor?.email}</p>
                                            </div>
                                        </td>
                                        <td className="text-gray-700">{visit.host?.name}</td>
                                        <td className="text-gray-700">{visit.branch?.name}</td>
                                        <td className="text-gray-500">
                                            {new Date(visit.scheduled_start_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <VisitStatusBadge status={visit.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No recent visits</p>
                            <p className="text-sm text-gray-400 mt-1">Visits will appear here once created</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
