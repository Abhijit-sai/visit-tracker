import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import KioskUserProfile from '@/components/KioskUserProfile'

export default async function KioskLandingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-4 relative">
            {user && <KioskUserProfile email={user.email || 'User'} />}

            <div className="max-w-2xl w-full text-center space-y-12">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Welcome
                    </h1>
                    <p className="text-xl text-gray-400">
                        Please register your visit to proceed.
                    </p>
                </div>

                <div className="flex flex-col gap-4 items-center">
                    <Link
                        href="/visit/new"
                        className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-xl font-medium hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                        Start New Visit
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/security"
                        className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
                    >
                        Scheduled Visits
                    </Link>
                </div>

                <div className="pt-12 text-sm text-gray-600">
                    <p>Powered by VisitTracker</p>
                </div>
            </div>
        </div>
    )
}
