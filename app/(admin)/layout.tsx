import Link from 'next/link'
import { Toaster } from 'sonner'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    FileText,
    LogOut,
    Building2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    // Check if user has ADMIN role
    const { data: adminUser } = await supabase
        .from('admins')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (!adminUser || adminUser.role !== 'ADMIN') {
        // If they are KIOSK, send them to unauthorized page (so they can logout)
        if (adminUser?.role === 'KIOSK') {
            redirect('/unauthorized')
        }
        // Otherwise, sign out and go to login
        await supabase.auth.signOut()
        redirect('/admin/login')
    }

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/visits', label: 'Visits', icon: Calendar },
        { href: '/admin/employees', label: 'Employees', icon: Users },
        { href: '/admin/reports', label: 'Reports', icon: FileText },
        { href: '/admin/config', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">VisitTracker</h1>
                            <p className="text-xs text-gray-500">Admin Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all group"
                            >
                                <Icon className="w-5 h-5 group-hover:text-indigo-600" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-100">
                    <div className="px-4 py-3 bg-gray-50 rounded-lg mb-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Administrator</p>
                    </div>
                    <form action="/auth/signout" method="post">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
