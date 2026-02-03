import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KYCReviewCard } from "@/components/admin/KYCReviewCard";
import { toast } from "sonner";
import {
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle,
  LogOut,
} from "lucide-react";

interface KYCPainter {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  postcode: string;
  documentsCount: {
    idDocs: number;
    insuranceDocs: number;
    addressProof: number;
  };
  submittedAt: string;
}

interface DashboardStats {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  denied: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingKYCs, setPendingKYCs] = useState<KYCPainter[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPainterId, setSelectedPainterId] = useState<string | null>(
    null,
  );

  // Fetch pending KYCs and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/auth");
          return;
        }

        // Fetch pending KYCs
        const kycRes = await fetch(
          "/api/admin/kyc/pending?status=under_review",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!kycRes.ok) {
          if (kycRes.status === 403) {
            toast.error("Admin access required");
            navigate("/");
            return;
          }
          throw new Error("Failed to fetch pending KYCs");
        }

        const kycData = await kycRes.json();
        if (kycData.success) {
          setPendingKYCs(kycData.data.painters);
        }

        // Fetch stats
        const statsRes = await fetch("/api/admin/kyc/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.data.summary);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleApprove = async (painterId: string) => {
    setProcessingId(painterId);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await fetch(`/api/admin/kyc/${painterId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to approve KYC");
      }

      const data = await response.json();
      if (data.success) {
        setPendingKYCs(pendingKYCs.filter((k) => k.id !== painterId));
        toast.success("Painter approved successfully!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve painter",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (painterId: string) => {
    setSelectedPainterId(painterId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim() || !selectedPainterId) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessingId(selectedPainterId);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await fetch(
        `/api/admin/kyc/${selectedPainterId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to reject KYC");
      }

      const data = await response.json();
      if (data.success) {
        setPendingKYCs(pendingKYCs.filter((k) => k.id !== selectedPainterId));
        toast.success("Painter rejected with reason sent");
        setShowRejectModal(false);
        setRejectReason("");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject painter",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              KYC Verification & Platform Management
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Painters</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-yellow-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold">{stats.underReview}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-amber-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold">{stats.denied}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Pending KYCs Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Pending KYC Verifications ({pendingKYCs.length})
          </h2>

          {pendingKYCs.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
              <p className="text-gray-600">
                There are no pending KYC verifications to review.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingKYCs.map((painter) => (
                <KYCReviewCard
                  key={painter.id}
                  {...painter}
                  onReview={() => {
                    // In production, navigate to detailed review page
                    toast.info("Detailed review not implemented yet");
                  }}
                  onApprove={() => handleApprove(painter.id)}
                  onReject={() => handleRejectClick(painter.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Reject KYC</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this painter's KYC
              verification.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., ID document unclear, insurance expired, address proof invalid..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectSubmit}
                disabled={processingId !== null || !rejectReason.trim()}
                className="flex-1"
              >
                {processingId ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
