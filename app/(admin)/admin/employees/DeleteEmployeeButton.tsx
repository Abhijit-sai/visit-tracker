'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteEmployee } from '@/app/actions/employee-actions'
import { toast } from 'sonner'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'

interface DeleteEmployeeButtonProps {
    id: string
    name: string
}

export function DeleteEmployeeButton({ id, name }: DeleteEmployeeButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteEmployee(id)
            toast.success('Employee deleted successfully')
            setShowConfirm(false)
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('Failed to delete employee')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                title="Delete Employee"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <ConfirmationDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Employee"
                message={`Are you sure you want to delete ${name}? This action cannot be undone.`}
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </>
    )
}
