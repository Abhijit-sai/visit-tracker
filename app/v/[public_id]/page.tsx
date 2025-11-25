import { createClient } from '@/lib/supabase/client' // Use client for now, or server if we want SSR
// Wait, public route should be server component if possible for SEO/Performance, but we need to fetch by ID.
import { createClient as createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VisitStatusBadge } from '@/components/VisitStatusBadge'
import { format } from 'date-fns'
import { Building2, Calendar, User, Clock } from 'lucide-react'

// Note: We don't have a 'public_id' column in the schema yet, we are using UUID 'id'.
// In a real app, we might want a shorter public ID or a signed token.
// For v1, we'll use the UUID.

export default async function PublicVisitPage({ params }: { params: { public_id: string } }) {
    const supabase = await createServerClient()

    const { data: visit } = await supabase
        .from('visits')
        .select(`
      *,
      visitor:visitors(full_name, company),
      host:employees(name, designation),
      branch:branches(name, address)
    `)
        .eq('id', params.public_id)
        .single()

    if (!visit) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-black p-6 text-white text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-80" />
                    <h1 className="text-xl font-bold">Visit Status</h1>
                    <p className="text-gray-400 text-sm mt-1">{visit.branch.name}</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="text-center">
                        <VisitStatusBadge status={visit.status} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Visitor</p>
                                <p className="font-medium">{visit.visitor.full_name}</p>
                                {visit.visitor.company && <p className="text-sm text-gray-600">{visit.visitor.company}</p>}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Host</p>
                                <p className="font-medium">{visit.host.name}</p>
                                <p className="text-sm text-gray-600">{visit.host.designation}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Scheduled</p>
                                <p className="font-medium">{format(new Date(visit.scheduled_start_at), 'PP p')}</p>
                            </div>
                        </div>

                        {visit.checkin_at && (
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Checked In</p>
                                    <p className="font-medium text-green-700">{format(new Date(visit.checkin_at), 'p')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                            Visit ID: {visit.id.slice(0, 8)}...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
