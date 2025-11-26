'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, ChevronUp, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

interface KioskUserProfileProps {
    email: string
}

export default function KioskUserProfile({ email }: KioskUserProfileProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        setLoading(true)
        try {
            await supabase.auth.signOut()
            toast.success('Signed out successfully')
            // Force a hard navigation to ensure state is cleared
            window.location.href = '/visit/login'
        } catch (error) {
            console.error('Sign out error:', error)
            toast.error('Error signing out')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="absolute top-4 right-4 z-50">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all border border-gray-700"
                >
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium hidden md:block">{email}</span>
                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2">
                            <button
                                onClick={handleSignOut}
                                disabled={loading}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                {loading ? 'Signing out...' : 'Sign Out'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
