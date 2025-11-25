'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Camera, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { uploadVisitorPhoto } from '@/app/actions/kiosk-actions'

// Types
type Step = 'VISITOR' | 'VISIT' | 'PHOTO' | 'REVIEW'

// Schema (Client-side validation)
const visitorSchema = z.object({
    full_name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    company: z.string().optional(),
    designation: z.string().optional(),
})

const visitSchema = z.object({
    host_employee_id: z.string().min(1, 'Host is required'),
    purpose: z.string().min(1, 'Purpose is required'),
    purpose_other: z.string().optional(),
    validity_hours: z.coerce.number().positive(),
    additional_visitor_count: z.coerce.number().min(0).default(0),
    additional_visitor_names: z.string().optional(),
})

function NewVisitContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [step, setStep] = useState<Step>('VISITOR')
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)

    // Data
    const [hosts, setHosts] = useState<any[]>([])
    const [branches, setBranches] = useState<any[]>([])
    const [fieldConfig, setFieldConfig] = useState<Record<string, any>>({})
    const [currentBranchId, setCurrentBranchId] = useState<string | null>(null)

    // Photo State
    const [photo, setPhoto] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [cameraActive, setCameraActive] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)

    // Forms
    // Dynamic Schema
    const getVisitorSchema = (config: Record<string, any>) => {
        return z.object({
            full_name: z.string().min(1, 'Name is required'),
            email: z.string().email('Invalid email'),
            phone: z.string().refine(val => {
                if (config['visitor.phone']?.is_required && (!val || val.length < 1)) return false
                return true
            }, 'Phone is required'),
            company: z.string().refine(val => {
                if (config['visitor.company']?.is_required && (!val || val.length < 1)) return false
                return true
            }, 'Company is required'),
            designation: z.string().refine(val => {
                if (config['visitor.designation']?.is_required && (!val || val.length < 1)) return false
                return true
            }, 'Designation is required'),
        })
    }

    const visitorForm = useForm({
        resolver: async (data, context, options) => {
            // Create schema with current config
            const schema = getVisitorSchema(fieldConfig)
            return zodResolver(schema)(data, context, options) as any
        },
        defaultValues: {
            full_name: '',
            email: '',
            phone: '',
            company: '',
            designation: '',
        }
    })

    const visitForm = useForm({
        resolver: zodResolver(visitSchema),
        defaultValues: {
            host_employee_id: '',
            purpose: '',
            purpose_other: '',
            validity_hours: 1,
            additional_visitor_count: 0,
            additional_visitor_names: '',
        }
    })

    // Initialization
    useEffect(() => {
        const init = async () => {
            try {
                // 1. Get Branch (from URL or default)
                const { data: branchesData } = await supabase.from('branches').select('*').eq('is_active', true)
                if (branchesData) {
                    setBranches(branchesData)
                    const paramBranch = searchParams.get('branch_id')
                    const defaultBranch = branchesData.find(b => b.id === paramBranch) || branchesData[0]
                    if (defaultBranch) setCurrentBranchId(defaultBranch.id)
                }

                // 2. Get Hosts
                const { data: hostsData } = await supabase.from('employees').select('*').eq('is_active', true)
                if (hostsData) setHosts(hostsData)

                // 3. Get Field Config
                const { data: configData } = await supabase.from('field_config').select('*')
                if (configData) {
                    const configMap = configData.reduce((acc, item) => {
                        acc[item.field_key] = item
                        return acc
                    }, {} as Record<string, any>)
                    setFieldConfig(configMap)
                }
            } catch (e) {
                console.error(e)
                toast.error('Failed to load configuration')
            } finally {
                setInitializing(false)
            }
        }
        init()
    }, [])

    // Camera Logic
    const startCamera = async () => {
        try {
            console.log('Requesting camera access...')

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error('Camera API not supported in this browser')
                return
            }

            // Check for cameras
            try {
                const devices = await navigator.mediaDevices.enumerateDevices()
                const cameras = devices.filter(d => d.kind === 'videoinput')
                console.log('Cameras found:', cameras.length, cameras)

                if (cameras.length === 0) {
                    toast.error('No camera devices found')
                    // Continue anyway to try getUserMedia as fallback
                }
            } catch (e) {
                console.warn('Error enumerating devices:', e)
            }

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            })
            console.log('Camera access granted', newStream.id, newStream.active)

            setStream(newStream)
            setCameraActive(true)
            toast.success('Camera started')

        } catch (err: any) {
            console.error('Camera error:', err)
            if (err.name === 'NotAllowedError') {
                toast.error('Camera permission denied. Please allow camera access.')
            } else if (err.name === 'NotFoundError') {
                toast.error('No camera found on this device.')
            } else {
                toast.error('Could not access camera: ' + err.message)
            }
        }
    }

    const stopCamera = () => {
        console.log('Stopping camera...')
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop()
                console.log('Track stopped:', track.label)
            })
            setStream(null)
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setCameraActive(false)
    }

    // Attach stream to video element when active
    useEffect(() => {
        if (cameraActive && stream && videoRef.current) {
            console.log('Attaching stream to video element')
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(e => {
                console.error('Error playing video:', e)
                toast.error('Failed to start video stream')
            })
        }
    }, [cameraActive, stream])

    // Cleanup on unmount or step change
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    // Also stop when changing steps if not in PHOTO step
    useEffect(() => {
        if (step !== 'PHOTO') {
            stopCamera()
        }
    }, [step])

    const capturePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas')
            canvas.width = videoRef.current.videoWidth
            canvas.height = videoRef.current.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
                setPhoto(dataUrl)
                stopCamera()
                toast.success('Photo captured!')
            }
        }
    }

    // Submission
    const handleSubmit = async () => {
        if (!currentBranchId) return
        setLoading(true)

        try {
            const visitorData = visitorForm.getValues()
            const visitData = visitForm.getValues()

            const payload = {
                visitor: visitorData,
                visit: {
                    ...visitData,
                    branch_id: currentBranchId,
                }
            }

            const res = await fetch('/api/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to create visit')

            // Upload Photo if exists
            if (photo && data.visit?.id) {
                try {
                    // Convert base64 to blob
                    const res = await fetch(photo)
                    const blob = await res.blob()
                    const file = new File([blob], 'visitor-photo.jpg', { type: 'image/jpeg' })

                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('visitId', data.visit.id)
                    formData.append('visitorId', data.visit.visitor_id)
                    formData.append('organizationId', data.visit.organization_id)

                    await uploadVisitorPhoto(formData)
                } catch (photoError) {
                    console.error('Photo upload failed:', photoError)
                    toast.error('Visit created, but photo upload failed.')
                }
            }

            toast.success('Visit registered!')

            // Redirect based on status
            if (data.visit.status === 'PENDING_VERIFICATION') {
                router.push('/visit/verify')
            } else {
                router.push('/visit/success')
            }

        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm p-4">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold">New Visit</h1>
                        <div className="text-sm text-gray-500">
                            Step {step === 'VISITOR' ? 1 : step === 'VISIT' ? 2 : step === 'PHOTO' ? 3 : 4} of 4
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/visit')}
                        className="text-sm text-gray-500 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

                    {/* Step 1: Visitor Info */}
                    {step === 'VISITOR' && (
                        <form onSubmit={visitorForm.handleSubmit(() => setStep('VISIT'))} className="space-y-6">
                            <h2 className="text-2xl font-bold">Your Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name *</label>
                                    <input
                                        {...visitorForm.register('full_name')}
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="John Doe"
                                    />
                                    {visitorForm.formState.errors.full_name && (
                                        <p className="text-red-500 text-sm">{visitorForm.formState.errors.full_name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email *</label>
                                    <input
                                        {...visitorForm.register('email')}
                                        type="email"
                                        className="w-full p-3 border rounded-lg"
                                        placeholder="john@example.com"
                                    />
                                    {visitorForm.formState.errors.email && (
                                        <p className="text-red-500 text-sm">{visitorForm.formState.errors.email.message}</p>
                                    )}
                                </div>
                                {/* Configurable Fields */}
                                {(fieldConfig['visitor.phone']?.is_visible !== false) && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone {fieldConfig['visitor.phone']?.is_required && '*'}</label>
                                        <input
                                            {...visitorForm.register('phone')}
                                            className="w-full p-3 border rounded-lg"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                )}
                                {(fieldConfig['visitor.company']?.is_visible !== false) && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Company {fieldConfig['visitor.company']?.is_required && '*'}</label>
                                        <input
                                            {...visitorForm.register('company')}
                                            className="w-full p-3 border rounded-lg"
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                )}
                                {(fieldConfig['visitor.designation']?.is_visible !== false) && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Designation {fieldConfig['visitor.designation']?.is_required && '*'}</label>
                                        <input
                                            {...visitorForm.register('designation')}
                                            className="w-full p-3 border rounded-lg"
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2">
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Visit Details */}
                    {step === 'VISIT' && (
                        <form onSubmit={visitForm.handleSubmit(() => setStep('PHOTO'))} className="space-y-6">
                            <h2 className="text-2xl font-bold">Visit Details</h2>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Who are you visiting? *</label>
                                    <select
                                        {...visitForm.register('host_employee_id')}
                                        className="w-full p-3 border rounded-lg bg-white"
                                    >
                                        <option value="">Select a host</option>
                                        {hosts.map(host => (
                                            <option key={host.id} value={host.id}>{host.name} ({host.designation})</option>
                                        ))}
                                    </select>
                                    {visitForm.formState.errors.host_employee_id && (
                                        <p className="text-red-500 text-sm">{visitForm.formState.errors.host_employee_id.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Purpose *</label>
                                    <select
                                        {...visitForm.register('purpose')}
                                        className="w-full p-3 border rounded-lg bg-white"
                                    >
                                        <option value="">Select purpose</option>
                                        <option value="Meeting">Meeting</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Delivery">Delivery</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {visitForm.formState.errors.purpose && (
                                        <p className="text-red-500 text-sm">{visitForm.formState.errors.purpose.message}</p>
                                    )}
                                </div>

                                {visitForm.watch('purpose') === 'Other' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Specify Purpose</label>
                                        <input
                                            {...visitForm.register('purpose_other')}
                                            className="w-full p-3 border rounded-lg"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expected Duration (Hours)</label>
                                    <div className="flex gap-4">
                                        {[1, 2, 4, 8].map(h => (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => visitForm.setValue('validity_hours', h)}
                                                className={clsx(
                                                    "px-4 py-2 rounded-lg border",
                                                    visitForm.watch('validity_hours') === h ? "bg-black text-white border-black" : "bg-white text-gray-700 border-gray-300"
                                                )}
                                            >
                                                {h}h
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Additional Visitors</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-1">
                                            <input
                                                type="number"
                                                placeholder="Count"
                                                {...visitForm.register('additional_visitor_count', { valueAsNumber: true })}
                                                className="w-full p-3 border rounded-lg"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <input
                                                placeholder="Names (comma separated, optional)"
                                                {...visitForm.register('additional_visitor_names')}
                                                className="w-full p-3 border rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button type="button" onClick={() => setStep('VISITOR')} className="text-gray-600 flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button type="submit" className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2">
                                    Next <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Photo */}
                    {step === 'PHOTO' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Take a Photo</h2>
                            <div className="flex flex-col items-center justify-center space-y-4">
                                {photo ? (
                                    <div className="relative">
                                        <img src={photo} alt="Captured" className="w-64 h-64 object-cover rounded-lg" />
                                        <button
                                            onClick={() => setPhoto(null)}
                                            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md text-red-500"
                                        >
                                            Retake
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md bg-black rounded-lg overflow-hidden relative aspect-square flex items-center justify-center">
                                        {cameraActive ? (
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-white flex flex-col items-center">
                                                <Camera className="w-12 h-12 mb-2" />
                                                <button onClick={startCamera} className="underline">Start Camera</button>
                                            </div>
                                        )}
                                        {cameraActive && (
                                            <button
                                                onClick={capturePhoto}
                                                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white w-16 h-16 rounded-full border-4 border-gray-200"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={() => setStep('VISIT')} className="text-gray-600 flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={() => setStep('REVIEW')}
                                    className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2"
                                >
                                    {photo ? 'Next' : 'Skip Photo'} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 'REVIEW' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Review & Submit</h2>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Name</p>
                                        <p className="font-medium">{visitorForm.getValues('full_name')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Email</p>
                                        <p className="font-medium">{visitorForm.getValues('email')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Host</p>
                                        <p className="font-medium">
                                            {hosts.find(h => h.id === visitForm.getValues('host_employee_id'))?.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Purpose</p>
                                        <p className="font-medium">{visitForm.getValues('purpose')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={() => setStep('PHOTO')} className="text-gray-600 flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-medium"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Confirm Visit
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    )
}

export default function NewVisitPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        }>
            <NewVisitContent />
        </Suspense>
    )
}
