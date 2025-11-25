import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">You're all set!</h1>
                <p className="text-gray-600">
                    Your visit has been registered. Please wait in the reception area while we notify your host.
                </p>
                <div className="pt-6">
                    <Link href="/visit" className="text-black underline hover:text-gray-600">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
