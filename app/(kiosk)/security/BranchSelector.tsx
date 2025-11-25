'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function BranchSelector({ branches, selectedBranchId }: { branches: any[], selectedBranchId: string | null }) {
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const branchId = e.target.value
        router.push(`/security?branchId=${branchId}`)
    }

    return (
        <select
            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={selectedBranchId || ''}
            onChange={handleChange}
        >
            {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
            ))}
        </select>
    )
}
