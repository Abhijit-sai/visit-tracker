import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center space-y-4 max-w-md">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-600">
                    Your account does not have permission to access this area.
                    Please contact your administrator.
                </p>
                <div className="pt-4">
                    <form action="/auth/signout" method="post">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
