import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  FileText,
  CheckCircle,
  Loader,
  ArrowRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Dispute {
  id: string;
  jobId: string;
  initiatedBy: string;
  otherId: string;
  reason: string;
  description: string;
  status: "open" | "in_review" | "resolved" | "closed";
  resolution?: string;
  customerRefundAmount?: number;
  painterCompensationAmount?: number;
  evidence: Array<{
    id: string;
    submittedBy: string;
    createdAt: string;
  }>;
  createdAt: string;
  resolvedAt?: string;
  initiatedByUser: {
    id: string;
    email: string;
    userType: string;
  };
  otherUser: {
    id: string;
    email: string;
    userType: string;
  };
}

export default function Disputes() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceText, setEvidenceText] = useState("");
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [navigate, filter]);

  const fetchDisputes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }
    const token = session.access_token;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter === "resolved" ? "resolved" : "open");
      }

      const response = await fetch(`/api/disputes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch disputes");
      }

      const data = await response.json();
      setDisputes(data.data.disputes);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDispute) {
      toast.error("No dispute selected");
      return;
    }

    if (!evidenceText.trim()) {
      toast.error("Please provide evidence");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/login"); return; }
    const token = session.access_token;
    setSubmittingEvidence(true);

    try {
      const response = await fetch(
        `/api/disputes/${selectedDispute.id}/evidence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            evidence: {
              type: "text",
              data: evidenceText,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit evidence");
      }

      toast.success("Evidence submitted successfully");
      setEvidenceText("");
      setShowEvidenceForm(false);

      // Refresh dispute
      fetchDisputes();
    } catch (error) {
      console.error("Error submitting evidence:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit evidence",
      );
    } finally {
      setSubmittingEvidence(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "in_review":
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800";
      case "in_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4 md:px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Disputes</h1>
          <p className="text-muted-foreground">
            Manage and resolve any job disputes
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8 flex-wrap"
        >
          {["all", "open", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted border border-border"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Disputes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : disputes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-12 text-center border border-border/50"
          >
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No disputes</h3>
            <p className="text-muted-foreground">
              {filter === "all"
                ? "You don't have any disputes yet."
                : `No ${filter} disputes found.`}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute, idx) => (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedDispute(dispute)}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:border-border hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(dispute.status)}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {dispute.reason}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Job ID: {dispute.jobId}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      dispute.status,
                    )}`}
                  >
                    {dispute.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-foreground mb-4">
                  {dispute.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Initiated by</p>
                    <p className="font-semibold">
                      {dispute.initiatedByUser.userType}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Evidence</p>
                    <p className="font-semibold">{dispute.evidence.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-semibold">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {dispute.status === "resolved" && (
                    <div>
                      <p className="text-muted-foreground">Resolution</p>
                      <p className="font-semibold">
                        {dispute.customerRefundAmount
                          ? `£${dispute.customerRefundAmount}`
                          : "Reviewed"}
                      </p>
                    </div>
                  )}
                </div>

                {dispute.status === "open" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDispute(dispute);
                      setShowEvidenceForm(true);
                    }}
                    className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Submit Evidence
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Evidence Submission Modal */}
        {showEvidenceForm && selectedDispute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEvidenceForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 max-w-md w-full border border-border"
            >
              <h2 className="text-2xl font-bold mb-4">Submit Evidence</h2>
              <form onSubmit={handleSubmitEvidence} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Evidence Details
                  </label>
                  <textarea
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    placeholder="Describe your evidence (messages, photos, documentation, etc.)"
                    disabled={submittingEvidence}
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEvidenceForm(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEvidence}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                  >
                    {submittingEvidence ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
