import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle2, XCircle, Shield, Users, Briefcase, AlertTriangle, RefreshCw } from "lucide-react";

const ADMIN_EMAIL = "o.a.alashe@paintbookco.co.uk";

type Painter = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  postcode: string;
  kyc_status: string;
  kyc_rejection_reason: string;
  insurance_verified: boolean;
  insurance_company: string;
  insurance_policy_number: string;
  insurance_expiry_date: string;
  insurance_certificate_url: string;
  insurance_submitted_at: string;
  is_active: boolean;
  completed_jobs: number;
  avg_rating: number;
  created_at: string;
  specialisms: string[];
};

type Job = {
  id: string;
  title: string;
  type: string;
  status: string;
  budget: number;
  total_price: number;
  created_at: string;
  customer_id: string;
  postcode: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"kyc" | "insurance" | "activate" | "jobs" | "disputes">("kyc");
  const [painters, setPainters] = useState<Painter[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.email !== ADMIN_EMAIL) {
      navigate("/login");
      return;
    }
    setAuthorized(true);
    setLoading(false);
    loadData();
  };

  const loadData = async () => {
    const { data: paintersData } = await supabase
      .from("painters")
      .select("*")
      .order("created_at", { ascending: false });
    if (paintersData) setPainters(paintersData);

    const { data: jobsData } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (jobsData) setJobs(jobsData);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const callAdminAction = async (
    painterId: string,
    updates: Record<string, unknown>,
    actionName: string,
    makeWebhookEnvKey?: string
  ) => {
    setActionLoading(painterId + actionName);
    const { error } = await supabase
      .from("painters")
      .update(updates)
      .eq("id", painterId);

    if (error) {
      showMessage(`Error: ${error.message}`);
    } else {
      showMessage(`✓ ${actionName} successful`);
      await loadData();

      // Fire Make.com webhook if provided
      if (makeWebhookEnvKey) {
        const painter = painters.find(p => p.id === painterId);
        try {
          const webhookMap: Record<string, string> = {
            MAKE_KYC_APPROVED_WEBHOOK: import.meta.env.VITE_MAKE_KYC_APPROVED_WEBHOOK || "",
          };
          const webhookUrl = webhookMap[makeWebhookEnvKey];
          if (webhookUrl) {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                painter_id: painterId,
                painter_email: painter?.email,
                painter_name: painter?.first_name,
                action: actionName,
              }),
            });
          }
        } catch (webhookErr) {
          console.error("Webhook error:", webhookErr);
        }
      }
    }
    setActionLoading(null);
  };

  const kycPending = painters.filter(p =>
    p.kyc_status === "pending" || p.kyc_status === "submitted"
  );

  const insurancePending = painters.filter(p =>
    p.insurance_submitted_at && !p.insurance_verified
  );

  const readyToActivate = painters.filter(p =>
    p.kyc_status === "approved" &&
    p.insurance_verified &&
    !p.is_active
  );

  const disputedJobs = jobs.filter(j => j.status === "disputed");

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-gray-700 text-gray-300",
      submitted: "bg-amber-900 text-amber-300",
      approved: "bg-green-900 text-green-300",
      rejected: "bg-red-900 text-red-300",
    };
    return map[status] || "bg-gray-700 text-gray-300";
  };

  const getJobStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending_match: "bg-gray-700 text-gray-300",
      in_progress: "bg-blue-900 text-blue-300",
      completed: "bg-green-900 text-green-300",
      disputed: "bg-red-900 text-red-300",
      cancelled: "bg-gray-800 text-gray-500",
    };
    return map[status] || "bg-gray-700 text-gray-300";
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-white" />
    </div>
  );

  if (!authorized) return null;

  const TABS = [
    { id: "kyc", label: "KYC Review", count: kycPending.length, icon: Shield },
    { id: "insurance", label: "Insurance", count: insurancePending.length, icon: Shield },
    { id: "activate", label: "Activate", count: readyToActivate.length, icon: Users },
    { id: "jobs", label: "All Jobs", count: jobs.length, icon: Briefcase },
    { id: "disputes", label: "Disputes", count: disputedJobs.length, icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">PaintBookCo Operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 bg-gray-800 text-gray-300 hover:text-white px-4 py-2 rounded text-sm border border-gray-700 hover:border-gray-500"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 bg-green-900/50 border border-green-700 rounded-lg px-4 py-3 text-green-300 text-sm">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                tab === t.id
                  ? "bg-orange-900/30 border-orange-700"
                  : "bg-gray-900 border-gray-800 hover:border-gray-600"
              }`}
            >
              <p className="text-2xl font-bold text-white">{t.count}</p>
              <p className="text-xs text-gray-400 mt-1">{t.label}</p>
            </button>
          ))}
        </div>

        {/* KYC REVIEW TAB */}
        {tab === "kyc" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">KYC Applications</h2>
            {kycPending.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No pending KYC applications</p>
            ) : kycPending.map(painter => (
              <div key={painter.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">
                      {painter.first_name} {painter.last_name}
                    </h3>
                    <p className="text-gray-400 text-sm">{painter.email}</p>
                    <p className="text-gray-500 text-xs">{painter.phone} · {painter.postcode}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(painter.kyc_status)}`}>
                    {painter.kyc_status}
                  </span>
                </div>
                {painter.specialisms?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {painter.specialisms.map(s => (
                      <span key={s} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-500 text-xs mb-4">
                  Registered: {new Date(painter.created_at).toLocaleDateString()}
                </p>
                <div className="flex gap-3 items-start">
                  <button
                    onClick={() => callAdminAction(
                      painter.id,
                      { kyc_status: "approved" },
                      "KYC Approved",
                      "MAKE_KYC_APPROVED_WEBHOOK"
                    )}
                    disabled={actionLoading === painter.id + "KYC Approved"}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    {actionLoading === painter.id + "KYC Approved"
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <CheckCircle2 className="h-3 w-3" />
                    }
                    Approve KYC
                  </button>
                  <div className="flex-1 flex gap-2">
                    <input
                      placeholder="Rejection reason..."
                      value={rejectReason[painter.id] || ""}
                      onChange={e => setRejectReason(r => ({ ...r, [painter.id]: e.target.value }))}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                    />
                    <button
                      onClick={() => callAdminAction(
                        painter.id,
                        {
                          kyc_status: "rejected",
                          kyc_rejection_reason: rejectReason[painter.id] || "Application unsuccessful."
                        },
                        "KYC Rejected"
                      )}
                      disabled={actionLoading === painter.id + "KYC Rejected"}
                      className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      {actionLoading === painter.id + "KYC Rejected"
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <XCircle className="h-3 w-3" />
                      }
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INSURANCE TAB */}
        {tab === "insurance" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Insurance Verification</h2>
            {insurancePending.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No pending insurance verifications</p>
            ) : insurancePending.map(painter => (
              <div key={painter.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">
                      {painter.first_name} {painter.last_name}
                    </h3>
                    <p className="text-gray-400 text-sm">{painter.email}</p>
                  </div>
                  <span className="text-xs bg-amber-900 text-amber-300 px-2 py-1 rounded">
                    Pending Verification
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Company</p>
                    <p className="text-white">{painter.insurance_company || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Policy Number</p>
                    <p className="text-white">{painter.insurance_policy_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Expiry Date</p>
                    <p className="text-white">{painter.insurance_expiry_date || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Submitted</p>
                    <p className="text-white">
                      {painter.insurance_submitted_at
                        ? new Date(painter.insurance_submitted_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                {painter.insurance_certificate_url && (
                  <a
                    href={painter.insurance_certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm underline block mb-4"
                  >
                    View Certificate →
                  </a>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => callAdminAction(
                      painter.id,
                      { insurance_verified: true },
                      "Insurance Verified"
                    )}
                    disabled={actionLoading === painter.id + "Insurance Verified"}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    {actionLoading === painter.id + "Insurance Verified"
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <CheckCircle2 className="h-3 w-3" />
                    }
                    Verify Insurance
                  </button>
                  <button
                    onClick={() => callAdminAction(
                      painter.id,
                      { insurance_verified: false, insurance_submitted_at: null },
                      "Insurance Rejected"
                    )}
                    disabled={actionLoading === painter.id + "Insurance Rejected"}
                    className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVATE TAB */}
        {tab === "activate" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Ready to Activate</h2>
            <p className="text-gray-400 text-sm">
              These painters have passed KYC and insurance verification. 
              Activate them to start receiving jobs.
            </p>
            {readyToActivate.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No painters ready to activate</p>
            ) : readyToActivate.map(painter => (
              <div key={painter.id} className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">
                      {painter.first_name} {painter.last_name}
                    </h3>
                    <p className="text-gray-400 text-sm">{painter.email}</p>
                    <p className="text-gray-500 text-xs">{painter.postcode}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">
                      KYC ✓
                    </span>
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">
                      Insurance ✓
                    </span>
                  </div>
                </div>
                {painter.specialisms?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {painter.specialisms.map(s => (
                      <span key={s} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => callAdminAction(
                    painter.id,
                    { is_active: true, profile_complete: true },
                    "Painter Activated"
                  )}
                  disabled={actionLoading === painter.id + "Painter Activated"}
                  className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  {actionLoading === painter.id + "Painter Activated"
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <CheckCircle2 className="h-3 w-3" />
                  }
                  Activate Painter
                </button>
              </div>
            ))}
          </div>
        )}

        {/* JOBS TAB */}
        {tab === "jobs" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Jobs</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-left">
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Budget</th>
                    <th className="pb-3 pr-4">Postcode</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                      <td className="py-3 pr-4 text-white">{job.title}</td>
                      <td className="py-3 pr-4 text-gray-400">{job.type}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded ${getJobStatusBadge(job.status)}`}>
                          {job.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">
                        {job.budget ? `£${job.budget}` : "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{job.postcode || "—"}</td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(job.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DISPUTES TAB */}
        {tab === "disputes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Open Disputes</h2>
            {disputedJobs.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No open disputes</p>
            ) : disputedJobs.map(job => (
              <div key={job.id} className="bg-gray-900 border border-red-900 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{job.title}</h3>
                    <p className="text-gray-400 text-sm">{job.type}</p>
                  </div>
                  <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">
                    Disputed
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Value</p>
                    <p className="text-white">
                      {job.total_price ? `£${job.total_price}` : job.budget ? `£${job.budget}` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Posted</p>
                    <p className="text-white">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => callAdminAction(
                      job.id,
                      { status: "completed" },
                      "Dispute Resolved — Completed"
                    )}
                    className="bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                  >
                    Resolve — Mark Complete
                  </button>
                  <button
                    onClick={() => callAdminAction(
                      job.id,
                      { status: "cancelled" },
                      "Dispute Resolved — Cancelled"
                    )}
                    className="bg-gray-700 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                  >
                    Resolve — Cancel Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
