import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Trash2, Search } from 'lucide-react'
import { deleteEmployee } from '@/app/actions/employee-actions'
import { DeleteEmployeeButton } from './DeleteEmployeeButton'

export default async function EmployeesPage() {
    const supabase = await createClient()

    const { data: employees } = await supabase
        .from('employees')
        .select(`*, branch:branches(name)`)
        .eq('is_active', true)
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                <Link
                    href="/admin/employees/new"
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                    <Plus className="w-4 h-4" /> Add Employee
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approval</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employees?.map((emp: any) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                    <div className="text-sm text-gray-500">{emp.designation}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{emp.email}</div>
                                    <div className="text-sm text-gray-500">{emp.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {emp.branch?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {emp.requires_host_approval ? (
                                        <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">Required</span>
                                    ) : (
                                        <span className="text-gray-400">Optional</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <DeleteEmployeeButton id={emp.id} name={emp.name} />
                                </td>
                            </tr>
                        ))}
                        {(!employees || employees.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No employees found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
