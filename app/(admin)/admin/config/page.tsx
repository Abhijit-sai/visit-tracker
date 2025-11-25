import { createClient } from '@/lib/supabase/server'
import { updateOrgConfig, updateFieldConfig } from '@/app/actions/config-actions'
import { Save } from 'lucide-react'
import { SettingsGuard } from '@/components/SettingsGuard'

export default async function ConfigPage() {
    const supabase = await createClient()

    // Get Org ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: admin } = await supabase.from('admins').select('organization_id').eq('auth_user_id', user.id).single()
    if (!admin) return null

    const { data: orgConfig } = await supabase
        .from('organization_config')
        .select('*')
        .eq('organization_id', admin.organization_id)
        .single()

    const { data: fieldConfigs } = await supabase
        .from('field_config')
        .select('*')
        .eq('organization_id', admin.organization_id)

    const getField = (key: string) => fieldConfigs?.find(f => f.field_key === key) || { is_visible: true, is_required: false }

    return (
        <SettingsGuard>
            <div className="space-y-8 max-w-4xl">
                <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>

                {/* Organization Config */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6">General Settings</h2>
                    <form action={updateOrgConfig} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Require Host Approval</label>
                                    <input
                                        type="checkbox"
                                        name="approval_required"
                                        defaultChecked={orgConfig?.approval_required}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
                                    <input
                                        type="checkbox"
                                        name="email_verification_required"
                                        defaultChecked={orgConfig?.email_verification_required}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Allow Manual Walk-in</label>
                                    <input
                                        type="checkbox"
                                        name="allow_manual_walkin"
                                        defaultChecked={orgConfig?.allow_manual_walkin}
                                        className="w-4 h-4 rounded border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Approval Recipient</label>
                                    <select
                                        name="approval_recipient"
                                        defaultValue={orgConfig?.approval_recipient}
                                        className="w-full p-2 border rounded-lg bg-white"
                                    >
                                        <option value="HOST">Host Only</option>
                                        <option value="SECURITY_EMAIL">Security Email Only</option>
                                        <option value="BOTH">Both</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Auto-cancel Incomplete (Hours)</label>
                                    <input
                                        type="number"
                                        name="auto_cancel_incomplete_after_hours"
                                        defaultValue={orgConfig?.auto_cancel_incomplete_after_hours}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                                <Save className="w-4 h-4" /> Save General Settings
                            </button>
                        </div>
                    </form>
                </div>

                {/* Field Config */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-6">Field Configuration</h2>
                    <form action={updateFieldConfig} className="space-y-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Field</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Visible</th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Required</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {[
                                        { key: 'visitor.company', label: 'Visitor Company' },
                                        { key: 'visitor.designation', label: 'Visitor Designation' },
                                        { key: 'visitor.phone', label: 'Visitor Phone' },
                                        { key: 'visitor.photo', label: 'Visitor Photo' },
                                        { key: 'visit.purpose_other', label: 'Other Purpose' },
                                    ].map(field => {
                                        const config = getField(field.key)
                                        return (
                                            <tr key={field.key}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{field.label}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        name={`${field.key}_visible`}
                                                        defaultChecked={config.is_visible}
                                                        className="w-4 h-4 rounded border-gray-300"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        name={`${field.key}_required`}
                                                        defaultChecked={config.is_required}
                                                        className="w-4 h-4 rounded border-gray-300"
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                                <Save className="w-4 h-4" /> Save Field Config
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SettingsGuard>
    )
}
