'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

interface VisitFiltersProps {
    branches: { id: string; name: string }[]
}

export function VisitFilters({ branches }: VisitFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        router.replace(`?${params.toString()}`)
    }, 300)

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.replace(`?${params.toString()}`)
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search visitors..."
                    className="w-full pl-9 pr-4 py-2 border rounded-md text-sm"
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />

                {/* Status Filter */}
                <select
                    className="border rounded-md py-2 px-3 text-sm bg-white"
                    defaultValue={searchParams.get('status')?.toString()}
                    onChange={(e) => updateFilter('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="APPROVED">Approved</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="CHECKED_OUT">Checked Out</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="DECLINED">Declined</option>
                </select>

                {/* Branch Filter */}
                <select
                    className="border rounded-md py-2 px-3 text-sm bg-white"
                    defaultValue={searchParams.get('branchId')?.toString()}
                    onChange={(e) => updateFilter('branchId', e.target.value)}
                >
                    <option value="">All Branches</option>
                    {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                </select>

                {/* Date Range */}
                <input
                    type="date"
                    className="border rounded-md py-2 px-3 text-sm"
                    defaultValue={searchParams.get('startDate')?.toString()}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    placeholder="Start Date"
                />
                <span className="text-gray-400">-</span>
                <input
                    type="date"
                    className="border rounded-md py-2 px-3 text-sm"
                    defaultValue={searchParams.get('endDate')?.toString()}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    placeholder="End Date"
                />
            </div>
        </div>
    )
}
