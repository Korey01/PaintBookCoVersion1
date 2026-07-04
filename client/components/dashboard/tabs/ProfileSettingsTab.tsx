import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// Sanitize storage path to prevent path traversal
const sanitizeStoragePath = (p: string) => p.replace(/\.\.[\/\\]/g, '').replace(/^\/+/, '');


const SPECIALISMS = [
  'Interior Painting', 'Exterior Painting', 'Wallpapering',
  'Feature Wall', 'TV/Media Wall', 'Commercial Painting',
  'Full Interior Refurb', 'Full Exterior Refurb',
  'New Build Decoration', 'Landlord Refresh', 'Specialist/Other'
]

export function ProfileSettingsTab({ painter, onRefresh }: { painter: any, onRefresh: () => void }) {
  const [profileForm, setProfileForm] = useState({
    first_name: painter?.first_name || '',
    last_name: painter?.last_name || '',
    phone: painter?.phone || '',
    bio: painter?.bio || '',
    city: painter?.city || '',
    postcode: painter?.postcode || '',
  })
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>(painter?.specialisms || [])
  const [serviceRadius, setServiceRadius] = useState(painter?.service_radius_km || 10)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  const [insuranceForm, setInsuranceForm] = useState({
    insurance_company: '',
    insurance_policy_number: '',
    insurance_policy_details: '',
    insurance_expiry_date: '',
  })
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [submittingInsurance, setSubmittingInsurance] = useState(false)
  const [insuranceSuccess, setInsuranceSuccess] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ newPass: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const passwordStrength = (pwd: string) => {
    const score = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/, /.{8,}/]
      .filter(r => r.test(pwd)).length
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' }
    if (score === 3) return { label: 'Fair', color: 'bg-amber-500', width: '50%' }
    if (score === 4) return { label: 'Good', color: 'bg-blue-500', width: '75%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    await supabase.from('painters').update({
      ...profileForm,
      specialisms: selectedSpecialisms,
      service_radius_km: serviceRadius,
    }).eq('id', painter.id)

    if (profileForm.postcode !== painter.postcode) {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geocode-postcode`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ postcode: profileForm.postcode, painter_id: painter.id })
        }
      )
    }
    setSavingProfile(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
    onRefresh()
  }

  const submitInsurance = async () => {
    if (!insuranceFile) { alert('Please select a certificate file'); return }
    if (insuranceFile.size > 5 * 1024 * 1024) { alert('File must be under 5MB'); return }
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(insuranceFile.type)) { alert('Only PDF, JPG and PNG accepted'); return }
    if (!insuranceForm.insurance_company) { alert('Insurance company is required'); return }
    if (!insuranceForm.insurance_policy_number) { alert('Policy number is required'); return }
    if (!insuranceForm.insurance_expiry_date) { alert('Expiry date is required'); return }

    setSubmittingInsurance(true)
    try {
      const fileExt = insuranceFile.name.split('.').pop()
      const path = sanitizeStoragePath(`${painter.id}/${Date.now()}_insurance.${fileExt}`)
      const { error: uploadError } = await supabase.storage
        .from('painter-insurance')
        .upload(path, insuranceFile, { upsert: true })
      if (uploadError) { alert(`Upload failed: ${uploadError.message}`); setSubmittingInsurance(false); return }

      const { data: { publicUrl } } = supabase.storage.from('painter-insurance').getPublicUrl(path)

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-insurance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            ...insuranceForm,
            insurance_policy_details: insuranceForm.insurance_policy_details || 'Not provided',
            insurance_certificate_url: publicUrl,
            certificate_size_bytes: insuranceFile.size,
          })
        }
      )
      const result = await res.json()
      if (result.success) {
        setInsuranceSuccess(true)
        setInsuranceFile(null)
        setInsuranceForm({ insurance_company: '', insurance_policy_number: '', insurance_policy_details: '', insurance_expiry_date: '' })
        onRefresh()
      } else {
        alert(result.error || 'Submission failed. Please try again.')
      }
    } catch (err) {
      alert('An unexpected error occurred. Please try again.')
    }
    setSubmittingInsurance(false)
  }

  const changePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) { setPasswordMsg('Passwords do not match'); return }
    if (passwordForm.newPass.length < 8) { setPasswordMsg('Password must be at least 8 characters'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass })
    setSavingPassword(false)
    if (error) { setPasswordMsg(error.message) }
    else { setPasswordMsg('Password updated successfully'); setPasswordForm({ newPass: '', confirm: '' }) }
  }

  const fieldClass = "w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Personal Details */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Personal Details</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'first_name', label: 'First Name' },
            { key: 'last_name', label: 'Last Name' },
            { key: 'phone', label: 'Phone' },
            { key: 'city', label: 'City' },
            { key: 'postcode', label: 'Postcode' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-gray-400 text-xs block mb-1">{f.label}</label>
              <input value={(profileForm as any)[f.key] || ''}
                onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={fieldClass} />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label className="text-gray-400 text-xs block mb-1">Bio (max 500 chars)</label>
          <textarea value={profileForm.bio}
            onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
            maxLength={500} rows={3} className={fieldClass} />
          <p className="text-gray-600 text-xs text-right">{profileForm.bio.length}/500</p>
        </div>
        <div className="mt-2 p-3 bg-gray-800 rounded">
          <p className="text-gray-500 text-xs">Email: {painter.email} (cannot be changed)</p>
        </div>
        <div className="mt-4">
          <label className="text-gray-400 text-xs block mb-2">Specialisms</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALISMS.map(s => (
              <button key={s} type="button"
                onClick={() => setSelectedSpecialisms(prev =>
                  prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                )}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  selectedSpecialisms.includes(s)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-gray-400'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="text-gray-400 text-xs block mb-2">
            Service Radius: {serviceRadius}km
          </label>
          <input type="range" min="5" max="50" value={serviceRadius}
            onChange={e => setServiceRadius(Number(e.target.value))}
            className="w-full" />
        </div>
        <button onClick={saveProfile} disabled={savingProfile}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
          {savingProfile ? 'Saving...' : profileSaved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Insurance */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Insurance Details</h3>
        {painter.insurance_verified ? (
          <div className="p-3 bg-green-900/30 border border-green-800 rounded">
            <p className="text-green-400 font-medium">✓ Insurance Verified</p>
            <p className="text-green-300 text-sm mt-1">{painter.insurance_company} — {painter.insurance_policy_number}</p>
            <p className="text-green-400 text-xs mt-1">Expires: {painter.insurance_expiry_date}</p>
          </div>
        ) : painter.insurance_submitted_at && !insuranceSuccess ? (
          <div className="p-3 bg-amber-900/30 border border-amber-800 rounded">
            <p className="text-amber-400 font-medium">⏳ Under Review</p>
            <p className="text-amber-300 text-sm">Submitted {new Date(painter.insurance_submitted_at).toLocaleDateString()}</p>
            <p className="text-amber-400 text-xs mt-1">Our team will verify within 1-2 working days.</p>
          </div>
        ) : insuranceSuccess ? (
          <div className="p-3 bg-green-900/30 border border-green-800 rounded">
            <p className="text-green-400 font-medium">✓ Insurance Submitted Successfully</p>
            <p className="text-green-300 text-sm">Our team will verify your insurance within 1-2 working days.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { key: 'insurance_company', label: 'Insurance Company', required: true },
              { key: 'insurance_policy_number', label: 'Policy Number', required: true },
            ].map(f => (
              <div key={f.key}>
                <label className="text-gray-400 text-xs block mb-1">{f.label} *</label>
                <input value={(insuranceForm as any)[f.key] || ''}
                  onChange={e => setInsuranceForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={fieldClass} />
              </div>
            ))}
            <div>
              <label className="text-gray-400 text-xs block mb-1">Expiry Date *</label>
              <input type="date" value={insuranceForm.insurance_expiry_date}
                onChange={e => setInsuranceForm(p => ({ ...p, insurance_expiry_date: e.target.value }))}
                className={fieldClass} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Policy Details</label>
              <textarea value={insuranceForm.insurance_policy_details}
                onChange={e => setInsuranceForm(p => ({ ...p, insurance_policy_details: e.target.value }))}
                rows={2} className={fieldClass} />
            </div>
            <div>
              <label className="text-gray-400 text-xs block mb-1">Certificate (PDF/JPG/PNG — max 5MB) *</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setInsuranceFile(e.target.files?.[0] || null)}
                className="text-gray-400 text-sm" />
              {insuranceFile && (
                <div className="mt-2 p-2 bg-gray-800 rounded flex items-center justify-between">
                  <div>
                    <p className="text-white text-xs">{insuranceFile.name}</p>
                    <p className={`text-xs mt-0.5 ${insuranceFile.size > 5242880 ? 'text-red-400' : 'text-gray-500'}`}>
                      {(insuranceFile.size / 1048576).toFixed(2)} MB / 5 MB max
                    </p>
                  </div>
                  <button onClick={() => setInsuranceFile(null)}
                    className="text-red-400 text-xs hover:text-red-300">Remove</button>
                </div>
              )}
            </div>
            <button onClick={submitInsurance} disabled={submittingInsurance || !insuranceFile}
              className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
              {submittingInsurance ? 'Uploading...' : 'Submit Insurance'}
            </button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Change Password</h3>
        <div className="space-y-4">
          <p className="text-gray-500 text-xs mb-2">You must be logged in to change your password.</p>
          {[
            { key: 'newPass', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-gray-400 text-xs block mb-1">{f.label}</label>
              <input type="password" value={(passwordForm as any)[f.key]}
                onChange={e => setPasswordForm(p => ({ ...p, [f.key]: e.target.value }))}
                className={fieldClass} />
            </div>
          ))}
          {passwordForm.newPass && (() => {
            const s = passwordStrength(passwordForm.newPass)
            return (
              <div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1">
                  <div className={`h-1.5 rounded-full transition-all ${s.color}`} style={{ width: s.width }} />
                </div>
                <p className="text-xs text-gray-500">Strength: {s.label}</p>
              </div>
            )
          })()}
          {passwordMsg && (
            <p className={`text-sm ${passwordMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {passwordMsg}
            </p>
          )}
          <button onClick={changePassword} disabled={savingPassword}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-white font-medium mb-4">Account</h3>
        <div className="space-y-3">
          <button onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            const res = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-my-data`,
              { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY } }
            )
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = 'paintbookco-data.json'; a.click()
          }}
            className="w-full text-left px-4 py-3 border border-gray-700 rounded text-gray-300 hover:border-gray-500 text-sm">
            Download My Data
          </button>
          <button onClick={async () => {
            const input = prompt('Type DELETE to confirm account deletion:')
            if (input !== 'DELETE') return
            const { data: { session } } = await supabase.auth.getSession()
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-my-account`,
              { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY } }
            )
            await supabase.auth.signOut()
            window.location.href = '/'
          }}
            className="w-full text-left px-4 py-3 border border-red-900 rounded text-red-400 hover:border-red-700 text-sm">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  )
}
