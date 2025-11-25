'use client'

import { useState } from 'react'
import { checkInVisitor, checkOutVisitor } from '@/app/actions/security-actions'
import { toast } from 'sonner'
import { Loader2, LogIn, LogOut } from 'lucide-react'

export function SecurityVisitActions({ visit }: { visit: any }) {
    const [loading, setLoading] = useState(false)

    const handleCheckIn = async () => {
        setLoading(true)
        try {
            await checkInVisitor(visit.id)
            toast.success('Visitor checked in')
        } catch (error) {
            toast.error('Failed to check in visitor')
        } finally {
            setLoading(false)
        }
    }

    const handleCheckOut = async () => {
        setLoading(true)
        try {
            await checkOutVisitor(visit.id)
            toast.success('Visitor checked out')
        } catch (error) {
            toast.error('Failed to check out visitor')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    }

    if (visit.status === 'APPROVED') {
        return (
            <button
                onClick={handleCheckIn}
                className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
                <LogIn className="w-4 h-4" /> Check In
            </button>
        )
    }

    if (visit.status === 'CHECKED_IN') {
        return (
            <button
                onClick={handleCheckOut}
                className="inline-flex items-center gap-1 bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-900 transition-colors"
            >
                <LogOut className="w-4 h-4" /> Check Out
            </button>
        )
    }

    return null
}
