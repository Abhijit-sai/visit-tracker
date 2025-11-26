import Link from "next/link";
import { ShieldCheck, MonitorPlay, ArrowRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 sm:px-8">

                {/* Brand / Header */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
                        Acme Company
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed">
                        Visitor Management System
                    </p>
                </div>

                {/* Portals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

                    {/* Admin Portal Card */}
                    <Link
                        href="/admin"
                        target="_blank"
                        className="group flex flex-col p-8 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-white rounded-lg border border-gray-200 text-gray-900">
                                <ShieldCheck size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Portal</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Manage visits, analytics, and system settings.
                        </p>
                    </Link>

                    {/* Kiosk Portal Card */}
                    <Link
                        href="/visit"
                        target="_blank"
                        className="group flex flex-col p-8 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-3 bg-white rounded-lg border border-gray-200 text-gray-900">
                                <MonitorPlay size={24} strokeWidth={1.5} />
                            </div>
                            <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Kiosk Portal</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Self-service check-in for visitors.
                        </p>
                    </Link>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-gray-400 text-xs border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 space-y-2">
                    <p>
                        Built by <span className="text-gray-600">Abhijit</span> for <span className="text-gray-600">MadSoul Internal Use</span>
                    </p>
                    <p>
                        &copy; 2025 <a href="https://madsoul.in" target="_blank" className="hover:text-gray-900 transition-colors">madsoul.in</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
