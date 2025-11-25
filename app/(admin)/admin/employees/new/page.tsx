import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createEmployee } from '@/app/actions/employee-actions'

export default async function NewEmployeePage() {
    const supabase = await createClient()
    const { data: branches } = await supabase.from('branches').select('*').eq('is_active', true)

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/employees" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add Employee</h1>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <form action={createEmployee} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name *</label>
                            <input name="name" required className="w-full p-3 border rounded-lg" placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email *</label>
                            <input name="email" type="email" required className="w-full p-3 border rounded-lg" placeholder="jane@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Designation</label>
                            <input name="designation" className="w-full p-3 border rounded-lg" placeholder="Product Manager" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Phone</label>
                            <input name="phone" className="w-full p-3 border rounded-lg" placeholder="+1 234..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Branch *</label>
                            <select name="branch_id" required className="w-full p-3 border rounded-lg bg-white">
                                <option value="">Select Branch</option>
                                {branches?.map((b: any) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="approval" name="requires_host_approval" className="w-4 h-4 rounded border-gray-300" />
                        <label htmlFor="approval" className="text-sm font-medium">Requires Host Approval for all visits</label>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800">
                            Create Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
