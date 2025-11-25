import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react'
import { VisitStatusBadge } from '@/components/VisitStatusBadge'
import { format } from 'date-fns'
import { updateVisitStatus, checkInVisitor, checkOutVisitor } from '@/app/actions/visit-actions'
import { DocumentUpload } from '@/components/DocumentUpload'

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: visit } = await supabase
        .from('visits')
        .select(`
      *,
      visitor:visitors(*),
      host:employees(*),
      branch:branches(*),
      history:visit_status_history(*),
      attachments(*)
    `)
        .eq('id', id)
        .single()

    if (!visit) {
        notFound()
    }

    // Actions
    const approveVisit = async () => {
        'use server'
        await updateVisitStatus(visit.id, 'APPROVED')
    }

    const declineVisit = async () => {
        'use server'
        await updateVisitStatus(visit.id, 'DECLINED', 'Declined by Admin')
    }

    const cancelVisit = async () => {
        'use server'
        await updateVisitStatus(visit.id, 'CANCELLED', 'Cancelled by Admin')
    }

    const checkIn = async () => {
        'use server'
        await checkInVisitor(visit.id)
    }

    const checkOut = async () => {
        'use server'
        await checkOutVisitor(visit.id)
    }

    // Sort history
    const sortedHistory = visit.history?.sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/visits" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Visit Details</h1>
                <div className="ml-auto flex gap-2">
                    {visit.status === 'PENDING_APPROVAL' && (
                        <>
                            <form action={approveVisit}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                            </form>
                            <form action={declineVisit}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                    <XCircle className="w-4 h-4" /> Decline
                                </button>
                            </form>
                        </>
                    )}
                    {visit.status === 'APPROVED' && !visit.checkin_at && (
                        <form action={checkIn}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <LogIn className="w-4 h-4" /> Check In
                            </button>
                        </form>
                    )}
                    {visit.checkin_at && !visit.checkout_at && (
                        <form action={checkOut}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
                                <LogOut className="w-4 h-4" /> Check Out
                            </button>
                        </form>
                    )}
                    {['INCOMPLETE_PROFILE', 'PENDING_VERIFICATION', 'PENDING_APPROVAL', 'APPROVED'].includes(visit.status) && !visit.checkin_at && (
                        <form action={cancelVisit}>
                            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Visitor Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-semibold">Visitor Information</h2>
                            {/* Visitor Photo */}
                            {visit.attachments?.find((a: any) => a.type === 'VISITOR_PHOTO') && (
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/visit-attachments/${visit.attachments.find((a: any) => a.type === 'VISITOR_PHOTO').storage_path}`}
                                        alt="Visitor"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium">{visit.visitor.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{visit.visitor.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Company</p>
                                <p className="font-medium">{visit.visitor.company || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{visit.visitor.phone || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Visit Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4">Visit Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <div className="mt-1"><VisitStatusBadge status={visit.status} /></div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Host</p>
                                <p className="font-medium">{visit.host.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Purpose</p>
                                <p className="font-medium">{visit.purpose} {visit.purpose_other && `(${visit.purpose_other})`}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Branch</p>
                                <p className="font-medium">{visit.branch.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Scheduled</p>
                                <p className="font-medium">{format(new Date(visit.scheduled_start_at), 'PP p')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Validity</p>
                                <p className="font-medium">{visit.validity_hours} hours</p>
                            </div>
                            {visit.additional_visitor_count > 0 && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Additional Visitors ({visit.additional_visitor_count})</p>
                                    <p className="font-medium">{visit.additional_visitor_names || 'No names provided'}</p>
                                </div>
                            )}
                            {visit.checkin_at && (
                                <div>
                                    <p className="text-sm text-gray-500">Checked In</p>
                                    <p className="font-medium text-blue-600">{format(new Date(visit.checkin_at), 'p')}</p>
                                </div>
                            )}
                            {visit.checkout_at && (
                                <div>
                                    <p className="text-sm text-gray-500">Checked Out</p>
                                    <p className="font-medium text-gray-600">{format(new Date(visit.checkout_at), 'p')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Photos */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4">Attachments</h2>
                        <div className="space-y-4">
                            {visit.attachments?.map((att: any) => {
                                const isImage = att.storage_path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                                const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/visit-attachments/${att.storage_path}`;

                                return (
                                    <div key={att.id} className="group relative">
                                        <p className="text-xs text-gray-500 mb-1 capitalize">{att.type.replace('_', ' ').toLowerCase()}</p>
                                        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="block">
                                            {isImage ? (
                                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={publicUrl}
                                                        alt="Attachment"
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-video bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                                                    <span className="text-xs font-medium text-gray-500">View Document</span>
                                                </div>
                                            )}
                                        </a>
                                    </div>
                                )
                            })}
                            {(!visit.attachments || visit.attachments.length === 0) && (
                                <p className="text-sm text-gray-500">No attachments</p>
                            )}
                            <DocumentUpload visitId={visit.id} visitorId={visit.visitor_id} />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold mb-4">History</h2>
                        <div className="space-y-4">
                            {sortedHistory?.map((item: any) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {item.from_status ? `${item.from_status} → ` : ''}{item.to_status}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(item.created_at), 'MMM d, h:mm a')} by {item.changed_by_type}
                                        </p>
                                        {item.note && <p className="text-xs text-gray-600 mt-1 italic">"{item.note}"</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
