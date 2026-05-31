import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description?: string;
  jobType: string;
  postcode: string;
  budgetMin?: number;
  budgetMax?: number;
  status: string;
  createdAt: string;
  customerId: string;
}

interface Quote {
  id: string;
  jobId: string;
  status: string;
  jobPrice: number;
  totalPrice: number;
  createdAt: string;
  acceptedAt?: string;
}

export default function PainterDashboard() {
  const navigate = useNavigate();
  const [unreadCount] = useState(0); // TODO: Implement real-time notifications with socket.io

  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [myQuotes, setMyQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingQuote, setSubmittingQuote] = useState<string | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [quotePrice, setQuotePrice] = useState("");

  // Fetch available jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("paintbook:token");
        if (!token) {
          navigate("/join-painter");
          return;
        }

        const response = await fetch("/api/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch jobs");

        const data = await response.json();
        if (data.data && Array.isArray(data.data.jobs)) {
          setAvailableJobs(data.data.jobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load available jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [navigate]);

  // Fetch my quotes
  useEffect(() => {
    const fetchMyQuotes = async () => {
      try {
        const token = localStorage.getItem("paintbook:token");
        if (!token) return;

        // Fetch quotes for this painter - we'll need to implement a GET endpoint
        // For now, we'll fetch each job and check for quotes
        const quotesSet = new Map<string, Quote>();

        for (const job of availableJobs) {
          const response = await fetch(`/api/quotes/job/${job.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && Array.isArray(data.data.quotes)) {
              data.data.quotes.forEach((quote: Quote) => {
                quotesSet.set(quote.id, quote);
              });
            }
          }
        }

        setMyQuotes(Array.from(quotesSet.values()));
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    if (availableJobs.length > 0) {
      fetchMyQuotes();
    }
  }, [availableJobs]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !quotePrice) {
      toast.error("Please enter a price");
      return;
    }

    setSubmittingQuote(selectedJob.id);
    try {
      const token = localStorage.getItem("paintbook:token");
      if (!token) {
        navigate("/join-painter");
        return;
      }

      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          jobPrice: parseFloat(quotePrice),
          consultationFee: 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit quote");
      }

      toast.success("Quote submitted successfully!");
      setQuoteDialogOpen(false);
      setQuotePrice("");
      setSelectedJob(null);

      // Refresh quotes
      const quotesResponse = await fetch(`/api/quotes/job/${selectedJob.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (quotesResponse.ok) {
        const data = await quotesResponse.json();
        if (data.data && Array.isArray(data.data.quotes)) {
          setMyQuotes((prev) => [
            ...prev.filter((q) => q.jobId !== selectedJob.id),
            ...data.data.quotes,
          ]);
        }
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit quote",
      );
    } finally {
      setSubmittingQuote(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  const UK_HOLIDAYS: Record<string, string> = {
    "01-01": "Happy New Year! 🎉",
    "12-25": "Merry Christmas! 🎄",
    "12-26": "Happy Boxing Day! 🎁",
    "04-18": "Happy Good Friday! 🌿",
    "04-21": "Happy Easter Monday! 🐣",
    "05-05": "Happy Early May Bank Holiday! 🌸",
    "05-26": "Happy Spring Bank Holiday! ☀️",
    "08-25": "Happy Summer Bank Holiday! 🌞",
  };
  const todayKey = new Date().toLocaleDateString("en-GB", { month: "2-digit", day: "2-digit" }).split("/").reverse().join("-");
  const holidayMsg = UK_HOLIDAYS[todayKey];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FBF7F0" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#D85A30" }} />
      </div>
    );
  }

  const pendingPayout = myQuotes.filter(q => q.status === "accepted").reduce((s, q) => s + (q.totalPrice || 0), 0);
  const activeJobs = myQuotes.filter(q => q.status === "accepted").length;
  const completedJobs = myQuotes.filter(q => q.status === "completed").length;
  const newJobsCount = availableJobs.filter(j => !myQuotes.some(q => q.jobId === j.id)).length;

  return (
    <div className="min-h-screen" style={{ background: "#FBF7F0" }}>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid rgba(180,150,100,0.18)" }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img
            src="https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png"
            alt="PaintBookCo"
            className="h-6 w-auto"
          />
          <span className="text-xs" style={{ color: "#9B8A75" }}>Painter/Decorator Portal</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#3A3228" }}>
            {getGreeting()} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9B8A75" }}>
            {holidayMsg || "Browse available jobs and manage your quotes."}
          </p>
        </div>

        {/* New jobs alert */}
        {newJobsCount > 0 && (
          <div style={{ background: "#D85A30", color: "#fff" }} className="rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">🔔 {newJobsCount} new job{newJobsCount > 1 ? "s" : ""} in your area</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Check the Available Jobs tab to submit quotes.</p>
            </div>
          </div>
        )}

        {/* Notifications Badge */}
        {unreadCount > 0 && (
          <div style={{ background: "rgba(26,92,138,0.08)", border: "1px solid rgba(26,92,138,0.2)" }} className="rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" style={{ color: "#1A5C8A" }} />
              <span className="text-sm" style={{ color: "#1A5C8A" }}>
                You have {unreadCount} new notification{unreadCount !== 1 ? "s" : ""}
              </span>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-4 text-center">
            <p className="text-xs font-medium" style={{ color: "#9B8A75" }}>Pending Payout</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#2D5A3D" }}>£{pendingPayout.toFixed(0)}</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-4 text-center">
            <p className="text-xs font-medium" style={{ color: "#9B8A75" }}>Active Jobs</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#1A5C8A" }}>{activeJobs}</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-4 text-center">
            <p className="text-xs font-medium" style={{ color: "#9B8A75" }}>Completed</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#3A3228" }}>{completedJobs}</p>
          </div>
        </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2" style={{ background: "rgba(180,150,100,0.12)" }}>
          <TabsTrigger value="available" style={{ fontWeight: 500 }}>
            Available Jobs ({availableJobs.length})
          </TabsTrigger>
          <TabsTrigger value="quotes" style={{ fontWeight: 500 }}>
            My Quotes ({myQuotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Jobs Tab */}
        <TabsContent value="available" className="mt-5 space-y-4">
          {availableJobs.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-12 text-center">
              <Briefcase className="mx-auto h-10 w-10 mb-4" style={{ color: "#C4B5A5" }} />
              <p className="mb-4" style={{ color: "#9B8A75" }}>No jobs available in your area right now</p>
              <Button variant="outline" onClick={() => navigate("/painter-onboarding")}>
                Update Your Profile
              </Button>
            </div>
          ) : (
            availableJobs.map((job) => (
              <div key={job.id} style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: "#3A3228" }}>{job.title}</p>
                    <p className="text-sm mt-1 flex items-center gap-1.5" style={{ color: "#9B8A75" }}>
                      <MapPin className="h-3.5 w-3.5" />
                      {job.postcode}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(216,90,48,0.1)", color: "#D85A30" }}>{job.jobType}</span>
                </div>

                {job.description && (
                  <p className="text-sm leading-relaxed" style={{ color: "#9B8A75" }}>{job.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {job.budgetMin && (
                    <div>
                      <p className="text-xs" style={{ color: "#9B8A75" }}>Budget</p>
                      <p className="text-lg font-bold mt-0.5" style={{ color: "#2D5A3D" }}>
                        £{job.budgetMin}{job.budgetMax && ` – £${job.budgetMax}`}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs" style={{ color: "#9B8A75" }}>Posted</p>
                    <p className="font-semibold mt-0.5" style={{ color: "#3A3228" }}>{new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {myQuotes.some((q) => q.jobId === job.id) ? (
                  <button disabled className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 opacity-60" style={{ background: "rgba(45,90,61,0.1)", color: "#2D5A3D" }}>
                    <CheckCircle2 className="h-4 w-4" /> Already Quoted
                  </button>
                ) : (
                  <button
                    onClick={() => { setSelectedJob(job); setQuoteDialogOpen(true); }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: "#D85A30" }}
                  >
                    Submit Quote
                  </button>
                )}
              </div>
            ))
          )}
        </TabsContent>

        {/* My Quotes Tab */}
        <TabsContent value="quotes" className="mt-5 space-y-4">
          {myQuotes.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-12 text-center">
              <Briefcase className="mx-auto h-10 w-10 mb-4" style={{ color: "#C4B5A5" }} />
              <p style={{ color: "#9B8A75" }}>You haven't submitted any quotes yet</p>
            </div>
          ) : (
            myQuotes.map((quote) => (
              <div key={quote.id} style={{ background: "#fff", border: "1px solid rgba(180,150,100,0.18)" }} className="rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold" style={{ color: "#3A3228" }}>Quote #{quote.id.slice(0, 8)}</p>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                    background: quote.status === "accepted" ? "rgba(45,90,61,0.1)" : quote.status === "pending" ? "rgba(180,150,100,0.15)" : "rgba(216,90,48,0.1)",
                    color: quote.status === "accepted" ? "#2D5A3D" : quote.status === "pending" ? "#9B8A75" : "#D85A30",
                  }}>{quote.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs" style={{ color: "#9B8A75" }}>Quote Price</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: "#2D5A3D" }}>£{quote.jobPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "#9B8A75" }}>Total Price</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: "#2D5A3D" }}>£{quote.totalPrice}</p>
                  </div>
                </div>
                <p className="text-xs pt-2" style={{ borderTop: "1px solid rgba(180,150,100,0.15)", color: "#C4B5A5" }}>
                  Submitted on {new Date(quote.createdAt).toLocaleDateString()}
                </p>
                {quote.status === "accepted" && (
                  <div style={{ background: "rgba(45,90,61,0.08)", border: "1px solid rgba(45,90,61,0.2)" }} className="rounded-xl p-4">
                    <p className="text-sm font-semibold" style={{ color: "#2D5A3D" }}>✓ Quote accepted! Ready to start work</p>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      </div>

      {/* Quote Submission Dialog */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quote</DialogTitle>
            <DialogDescription>
              Enter your quote price for: {selectedJob?.title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitQuote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Quote Price (£)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={quotePrice}
                onChange={(e) => setQuotePrice(e.target.value)}
                placeholder="Enter your quote price"
                required
              />
            </div>
            {selectedJob?.budgetMin && selectedJob?.budgetMax && (
              <p className="text-sm text-gray-600">
                Customer budget: £{selectedJob.budgetMin} - £
                {selectedJob.budgetMax}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setQuoteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingQuote === selectedJob?.id}
              >
                {submittingQuote === selectedJob?.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quote"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
