import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GalleryTab } from './tabs/GalleryTab'
import { PaintBookChat } from '../chat/PaintBookChat'
import { AvailabilityTab } from './tabs/AvailabilityTab'
import { NotificationsTab } from './tabs/NotificationsTab'
import { ProfileSettingsTab } from './tabs/ProfileSettingsTab'

const TABS = [
  'Overview', 'Available Jobs', 'My Jobs',
  'Earnings', 'Gallery', 'Availability',
  'Profile', 'Notifications'
]

export function PainterDashboard() {
  const [activeTab, setActiveTab] = useState(0)
  const [painter, setPainter] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [availableJobs, setAvailableJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState<any>({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')
  const [insuranceForm, setInsuranceForm] = useState<any>({})
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
  const [submittingInsurance, setSubmittingInsurance] = useState(false)

  useEffect(() => {
    loadPainter()
  }, [])

  // Poll for KYC status when submitted
  useEffect(() => {
    if (painter?.kyc_status === 'submitted') {
      const interval = setInterval(async () => {
        await loadPainter()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [painter?.kyc_status])

  const loadPainter = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('painters')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setPainter(data)
      setProfileForm({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || '',
        bio: data.bio || '',
        city: data.city || '',
        postcode: data.postcode || '',
      })
      loadJobs(data.id)
      loadAvailableJobs()
    }
    setLoading(false)
  }

  const loadJobs = async (painterId: string) => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('assigned_painter_id', painterId)
      .order('created_at', { ascending: false })
    if (data) setJobs(data)
  }

  const loadAvailableJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('id, title, type, postcode, budget, start_date, end_date, created_at')
      .in('status', ['pending_match', 'matching_in_progress'])
      .is('assigned_painter_id', null)
      .order('created_at', { ascending: false })
    if (data) setAvailableJobs(data)
  }

  const acceptJob = async (jobId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accept-job`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ job_id: jobId })
      }
    )
    const result = await res.json()
    if (result.success) {
      setAvailableJobs(prev => prev.filter(j => j.id !== jobId))
      await loadJobs(painter.id)
    } else {
      alert(result.error || 'Failed to accept job')
    }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    await supabase.from('painters').update(profileForm).eq('id', painter.id)
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
    await loadPainter()
    setSavingProfile(false)
  }

  const changePassword = async () => {
    setPasswordMsg('')
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg('Passwords do not match')
      return
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordMsg('Password must be at least 8 characters')
      return
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: painter.email,
      password: passwordForm.current
    })
    if (signInError) {
      setPasswordMsg('Current password is incorrect')
      return
    }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPass })
    if (error) {
      setPasswordMsg(error.message)
    } else {
      setPasswordMsg('Password updated successfully')
      setPasswordForm({ current: '', newPass: '', confirm: '' })
    }
  }

  const submitInsurance = async () => {
    if (!insuranceFile) return
    setSubmittingInsurance(true)
    const path = `${painter.id}/${Date.now()}_${insuranceFile.name}`
    await supabase.storage.from('painter-insurance').upload(path, insuranceFile)
    const { data: { publicUrl } } = supabase.storage
      .from('painter-insurance').getPublicUrl(path)
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
          insurance_certificate_url: publicUrl,
          certificate_size_bytes: insuranceFile.size,
        })
      }
    )
    const result = await res.json()
    if (result.success) {
      await loadPainter()
    } else {
      alert(result.error)
    }
    setSubmittingInsurance(false)
  }

  const commissionRate = (jobs: number) => {
    if (jobs <= 5) return { rate: '12%', next: 6, label: 'amber' }
    if (jobs <= 10) return { rate: '10%', next: 11, label: 'blue' }
    return { rate: '8%', next: null, label: 'green' }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending_match: 'bg-gray-700 text-gray-300',
      matching_in_progress: 'bg-blue-900 text-blue-300',
      painter_accepted: 'bg-purple-900 text-purple-300',
      awaiting_payment: 'bg-amber-900 text-amber-300',
      escrow_funded: 'bg-teal-900 text-teal-300',
      in_progress: 'bg-blue-900 text-blue-300',
      milestone_review: 'bg-orange-900 text-orange-300',
      pending_completion: 'bg-green-900 text-green-300',
      completed: 'bg-green-700 text-green-100',
      disputed: 'bg-red-900 text-red-300',
      cancelled: 'bg-gray-800 text-gray-500',
    }
    return map[status] || 'bg-gray-700 text-gray-300'
  }

  const passwordStrength = (pwd: string) => {
    const score = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/, /.{8,}/]
      .filter(r => r.test(pwd)).length
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' }
    if (score === 3) return { label: 'Fair', color: 'bg-amber-500', width: '50%' }
    if (score === 4) return { label: 'Good', color: 'bg-blue-500', width: '75%' }
    return { label: 'Strong', color: 'bg-green-500', width: '100%' }
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading dashboard...</div>
    </div>
  )

  if (!painter) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Painter profile not found.</div>
    </div>
  )

  const commission = commissionRate(painter.completed_jobs)

  const completionSteps = [
    { label: 'Account created', done: true },
    { label: 'Email confirmed', done: !!painter.user_id },
    { label: 'KYC submitted', done: painter.kyc_status !== 'pending' },
    { label: 'KYC approved', done: painter.kyc_status === 'approved' },
    { label: 'Insurance submitted', done: !!painter.insurance_submitted_at },
    { label: 'Profile complete', done: painter.is_active },
  ]
  const completedSteps = completionSteps.filter(s => s.done).length
  const completionPct = Math.round((completedSteps / completionSteps.length) * 100)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {painter.first_name}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Painter Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium
              ${commission.label === 'amber' ? 'bg-amber-900 text-amber-300' :
                commission.label === 'blue' ? 'bg-blue-900 text-blue-300' :
                'bg-green-900 text-green-300'}`}>
              {commission.rate} Commission
            </span>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2 rounded hover:border-gray-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 overflow-x-auto mb-8 border-b border-gray-800 pb-0">
          {TABS.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm whitespace-nowrap transition-colors border-b-2 -mb-px
                ${activeTab === i
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* TAB 1 — OVERVIEW */}
        {activeTab === 0 && (
          <div className="space-y-6">
            {completionPct < 100 && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="flex justify-between mb-2">
                  <span className="text-white font-medium">Profile completion</span>
                  <span className="text-blue-400">{completionPct}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                  <div className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }} />
                </div>
                <div className="space-y-2">
                  {completionSteps.map(step => (
                    <div key={step.label} className="flex items-center gap-2 text-sm">
                      <span className={step.done ? 'text-green-400' : 'text-gray-600'}>
                        {step.done ? '✓' : '○'}
                      </span>
                      <span className={step.done ? 'text-gray-300' : 'text-gray-600'}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                {(painter.kyc_status === 'pending' || painter.kyc_status === 'rejected') && (
                  <button
                    onClick={async () => {
                      const { data: { session } } = await supabase.auth.getSession()
                      const res = await fetch(
                        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-kyc`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`,
                            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                          },
                          body: JSON.stringify({})
                        }
                      )
                      const result = await res.json()
                      if (result.verification_url) {
                        window.open(result.verification_url, '_blank')
                        alert('Complete your verification in the new tab. Return here when done and refresh your dashboard.')
                      } else {
                        alert(result.error || 'Failed to start KYC. Please try again.')
                      }
                    }}
                    className="mt-4 bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700">
                    {painter.kyc_status === 'rejected' ? 'Resubmit KYC Verification →' : 'Start KYC Verification →'}
                  </button>
                )}
                {painter.kyc_status === 'submitted' && (
                  <div className="mt-4 p-3 bg-amber-900/30 border border-amber-800 rounded">
                    <p className="text-amber-400 text-sm font-medium">⏳ KYC Under Review</p>
                    <p className="text-amber-300 text-xs mt-1">We will notify you by email when your verification is complete.</p>
                    <button
                      onClick={() => loadPainter()}
                      className="mt-2 text-blue-400 text-xs underline hover:text-blue-300"
                    >
                      Refresh my status
                    </button>
                  </div>
                )}
                {painter.kyc_status === 'rejected' && painter.kyc_rejection_reason && (
                  <div className="mt-2 p-3 bg-red-900/30 border border-red-800 rounded">
                    <p className="text-red-400 text-sm font-medium">✗ KYC Rejected</p>
                    <p className="text-red-300 text-xs mt-1">{painter.kyc_rejection_reason}</p>
                  </div>
                )}
                {!painter.insurance_submitted_at && painter.kyc_status === 'approved' && (
                  <button onClick={() => setActiveTab(6)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                    Submit Insurance →
                  </button>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Completed Jobs', value: painter.completed_jobs },
                { label: 'Average Rating', value: `${painter.avg_rating} ★` },
                { label: 'Active Jobs', value: jobs.filter(j => j.status === 'in_progress').length },
                { label: 'Commission Rate', value: commission.rate },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                  <p className="text-white text-xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
            {commission.next && (
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">
                  {commission.next - painter.completed_jobs} more jobs until your commission 
                  drops to {painter.completed_jobs <= 5 ? '10%' : '8%'}
                </p>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(painter.completed_jobs / commission.next) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2 — AVAILABLE JOBS */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {!painter.is_active || painter.kyc_status !== 'approved' || !painter.insurance_verified ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  Complete your profile to start receiving jobs
                </p>
                <button onClick={() => setActiveTab(6)}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                  Complete Profile
                </button>
              </div>
            ) : availableJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-12">
                No available jobs in your area right now
              </p>
            ) : (
              availableJobs.map(job => {
                const postcodeArea = job.postcode?.split(' ')[0] || 'Unknown area'
                const hoursLeft = Math.max(0,
                  48 - (Date.now() - new Date(job.created_at).getTime()) / 3600000
                )
                return (
                  <div key={job.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-white font-medium">{job.title}</h3>
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded mt-1 inline-block">
                          {job.type}
                        </span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-1 rounded
                        ${hoursLeft < 4 ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-400'}`}>
                        {hoursLeft.toFixed(0)}h left
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm text-gray-400 mb-4">
                      <div><span className="text-gray-600 text-xs">Area</span><br/>{postcodeArea}</div>
                      <div><span className="text-gray-600 text-xs">Budget</span><br/>£{job.budget}</div>
                      <div><span className="text-gray-600 text-xs">Start</span><br/>
                        {job.start_date ? new Date(job.start_date).toLocaleDateString() : 'Flexible'}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => acceptJob(job.id)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm">
                        Accept Job
                      </button>
                      <button onClick={() => setAvailableJobs(prev => prev.filter(j => j.id !== job.id))}
                        className="px-4 py-2 border border-gray-700 text-gray-400 rounded hover:border-gray-500 text-sm">
                        Pass
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* TAB 3 — MY JOBS */}
        {activeTab === 2 && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No jobs yet</p>
            ) : jobs.map(job => (
              <div key={job.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium">{job.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(job.status)}`}>
                    {job.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  {job.start_date ? new Date(job.start_date).toLocaleDateString() : 'No date set'}
                  {job.total_price && ` · £${job.total_price}`}
                </p>
                {job.status === 'escrow_funded' && (
                  <div className="mt-3 p-3 bg-teal-900/30 rounded border border-teal-800">
                    <p className="text-teal-300 text-sm font-medium">Payment confirmed</p>
                    <p className="text-teal-400 text-xs">Customer contact details available in your email</p>
                  </div>
                )}
                {(job.status === 'escrow_funded' ||
                  job.status === 'in_progress' ||
                  job.status === 'milestone_review' ||
                  job.status === 'pending_completion') && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-xs mb-2 font-medium">Chat with Customer</p>
                    <PaintBookChat
                      jobId={job.id}
                      userId={painter?.user_id ?? ""}
                      userRole="painter"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4 — EARNINGS */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'All Time', value: '£0' },
                { label: 'This Month', value: '£0' },
                { label: 'This Week', value: '£0' },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                  <p className="text-white text-xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm">
                Commission savings tracker will populate as you complete jobs.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5 — GALLERY */}
        {activeTab === 4 && <GalleryTab painter={painter} />}

        {/* TAB 6 — AVAILABILITY */}
        {activeTab === 5 && <AvailabilityTab painter={painter} />}

        {/* TAB 7 — PROFILE AND SETTINGS */}
        {activeTab === 6 && (
          <ProfileSettingsTab painter={painter} onRefresh={loadPainter} />
        )}
        {/* TAB 8 — NOTIFICATIONS */}
        {activeTab === 7 && <NotificationsTab painter={painter} />}
      </div>
    </div>
  )
}

export default PainterDashboard
