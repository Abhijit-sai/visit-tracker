// app/(admin)/admin/visits/new/page.tsx
"use client";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft } from 'lucide-react';

// Schema for the form
const visitSchema = z.object({
    visitor: z.object({
        full_name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        phone: z.string().optional(),
        company: z.string().optional(),
        designation: z.string().optional(),
    }),
    visit: z.object({
        branch_id: z.string().uuid('Branch is required'),
        host_employee_id: z.string().uuid('Host is required'),
        purpose: z.string().min(1, 'Purpose is required'),
        purpose_other: z.string().optional(),
        // validity will be entered as a number plus a unit (hours/days)
        validity: z.number().int().positive('Validity must be positive'),
        validity_unit: z.enum(['hours', 'days']),
        scheduled_start_at: z.string().min(1, 'Scheduled time is required'),
        additional_visitor_count: z.number().int().min(0).default(0),
        additional_visitor_names: z.string().optional(),
    }),
});

type FormData = z.infer<typeof visitSchema>;

export default function AdminCreateVisit() {
    const router = useRouter();
    const [branches, setBranches] = useState<Array<any>>([]);
    const [employees, setEmployees] = useState<Array<any>>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Load branches and employees
    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            const { data: branchData } = await supabase
                .from('branches')
                .select('id,name')
                .eq('is_active', true)
                .order('name');
            const { data: employeeData } = await supabase
                .from('employees')
                .select('id,name')
                .eq('is_active', true)
                .order('name');
            setBranches(branchData || []);
            setEmployees(employeeData || []);
            setLoadingData(false);
        };
        fetchData();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(visitSchema) as any,
        defaultValues: {
            visit: {
                validity: 4, // Default 4 hours
                validity_unit: 'hours',
                additional_visitor_count: 0,
            }
        }
    });

    const selectedPurpose = watch('visit.purpose');

    const onSubmit = async (data: FormData) => {
        // Convert validity + unit into hours
        const validityHours = data.visit.validity * (data.visit.validity_unit === 'days' ? 24 : 1);

        // Convert local datetime to UTC ISO string
        const scheduledStart = new Date(data.visit.scheduled_start_at).toISOString();

        const payload = {
            visitor: data.visitor,
            visit: {
                ...data.visit,
                validity_hours: validityHours,
                scheduled_start_at: scheduledStart,
                // Remove temporary fields
                validity: undefined,
                validity_unit: undefined,
            },
        };

        try {
            const res = await fetch('/api/admin/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create visit');
            }

            const { visit } = await res.json();
            router.push(`/admin/visits/${visit.id}`);
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Error creating visit');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <Link href="/admin/visits" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Visits
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Schedule New Visit</h1>
                <p className="text-sm text-gray-500 mt-1">Register a visitor and schedule their visit.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Visitor Information */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-50">Visitor Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input
                                    {...register('visitor.full_name')}
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {errors.visitor?.full_name && (
                                    <p className="text-red-600 text-xs mt-1">{errors.visitor.full_name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    {...register('visitor.email')}
                                    placeholder="john@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {errors.visitor?.email && (
                                    <p className="text-red-600 text-xs mt-1">{errors.visitor.email.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        {...register('visitor.phone')}
                                        placeholder="+1 234..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                                    <input
                                        {...register('visitor.designation')}
                                        placeholder="Manager"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    {...register('visitor.company')}
                                    placeholder="Acme Corp"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visit Details */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-50">Visit Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
                                    <select
                                        {...register('visit.branch_id')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        disabled={loadingData}
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    {errors.visit?.branch_id && (
                                        <p className="text-red-600 text-xs mt-1">{errors.visit.branch_id.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
                                    <select
                                        {...register('visit.host_employee_id')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        disabled={loadingData}
                                    >
                                        <option value="">Select Host</option>
                                        {employees.map((e) => (
                                            <option key={e.id} value={e.id}>{e.name}</option>
                                        ))}
                                    </select>
                                    {errors.visit?.host_employee_id && (
                                        <p className="text-red-600 text-xs mt-1">{errors.visit.host_employee_id.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                                <select
                                    {...register('visit.purpose')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">Select Purpose</option>
                                    <option value="Meeting">Meeting</option>
                                    <option value="Delivery">Delivery</option>
                                    <option value="Interview">Interview</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.visit?.purpose && (
                                    <p className="text-red-600 text-xs mt-1">{errors.visit.purpose.message}</p>
                                )}
                            </div>

                            {selectedPurpose === 'Other' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specify Purpose</label>
                                    <input
                                        {...register('visit.purpose_other')}
                                        placeholder="Details..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Start *</label>
                                <input
                                    type="datetime-local"
                                    {...register('visit.scheduled_start_at')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {errors.visit?.scheduled_start_at && (
                                    <p className="text-red-600 text-xs mt-1">{errors.visit.scheduled_start_at.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Validity</label>
                                    <input
                                        type="number"
                                        {...register('visit.validity', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                    <select
                                        {...register('visit.validity_unit')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Visitors</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-1">
                                        <input
                                            type="number"
                                            placeholder="Count"
                                            {...register('visit.additional_visitor_count', { valueAsNumber: true })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            placeholder="Names (comma separated, optional)"
                                            {...register('visit.additional_visitor_names')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link
                        href="/admin/visits"
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || loadingData}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Visit'}
                    </button>
                </div>
            </form>
        </div>
    );
}
