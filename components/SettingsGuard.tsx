'use client'

import { useState, useEffect } from 'react'
import { ReAuthModal } from './ReAuthModal'

export function SettingsGuard({ children }: { children: React.ReactNode }) {
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Check session storage on mount
        const unlocked = sessionStorage.getItem('settings_unlocked') === 'true'
        setIsUnlocked(unlocked)
        setChecking(false)
    }, [])

    if (checking) {
        return null // Or a loading spinner
    }

    if (!isUnlocked) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <ReAuthModal onSuccess={() => setIsUnlocked(true)} />
                <div className="text-center opacity-50 blur-sm pointer-events-none select-none" aria-hidden="true">
                    {children}
                </div>
            </div>
        )
    }

    return <>{children}</>
}
