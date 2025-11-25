import { Download } from 'lucide-react'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h2 className="text-lg font-semibold">Visit Logs</h2>
                    <p className="text-sm text-gray-500">
                        Export all visit records including visitor details, host, and timestamps.
                    </p>
                    <a
                        href="/api/reports/visits"
                        target="_blank"
                        className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium"
                    >
                        <Download className="w-4 h-4" /> Download CSV
                    </a>
                </div>
            </div>
        </div>
    )
}
