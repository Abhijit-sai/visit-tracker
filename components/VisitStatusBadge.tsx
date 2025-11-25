import { clsx } from 'clsx'

type VisitStatus =
    | 'INCOMPLETE_PROFILE'
    | 'PENDING_VERIFICATION'
    | 'PENDING_APPROVAL'
    | 'APPROVED'
    | 'CHECKED_IN'
    | 'CHECKED_OUT'
    | 'DECLINED'
    | 'CANCELLED'

const statusStyles: Record<VisitStatus, string> = {
    INCOMPLETE_PROFILE: 'bg-gray-100 text-gray-800',
    PENDING_VERIFICATION: 'bg-blue-100 text-blue-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    CHECKED_IN: 'bg-green-500 text-white',
    CHECKED_OUT: 'bg-gray-500 text-white',
    DECLINED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-600 line-through',
}

const statusLabels: Record<VisitStatus, string> = {
    INCOMPLETE_PROFILE: 'Incomplete',
    PENDING_VERIFICATION: 'Verifying',
    PENDING_APPROVAL: 'Pending Approval',
    APPROVED: 'Approved',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
    DECLINED: 'Declined',
    CANCELLED: 'Cancelled',
}

export function VisitStatusBadge({ status }: { status: string }) {
    const s = status as VisitStatus
    return (
        <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            statusStyles[s] || 'bg-gray-100 text-gray-800'
        )}>
            {statusLabels[s] || status}
        </span>
    )
}
