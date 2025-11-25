'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadVisitDocument } from '@/app/actions/upload-actions'
import { toast } from 'sonner'

interface DocumentUploadProps {
    visitId: string
    visitorId: string
}

export function DocumentUpload({ visitId, visitorId }: DocumentUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('visitId', visitId)
        formData.append('visitorId', visitorId)

        // Determine type based on file or user selection (simplifying to ID_PHOTO for generic upload for now)
        // In a real app, we might want a dropdown to select type before upload
        formData.append('type', 'ID_PHOTO')

        try {
            await uploadVisitDocument(formData)
            toast.success('Document uploaded successfully')
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload document')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="mt-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Upload className="w-4 h-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
            <p className="mt-1 text-xs text-gray-500">Supported: Images, PDF</p>
        </div>
    )
}
