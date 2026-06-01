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

function getGreeting() {
  const h = new Date().getHours();
  if(h>=5&&h<12) return 'Good morning';
  if(h>=12&&h<17) return 'Good afternoon';
  if(h>=17&&h<21) return 'Good evening';
  return 'Evening';
}

const UK_HOLIDAYS: Record<string,string> = {
  '01-01':'Happy New Year!','04-03':'Happy Good Friday.','04-06':'Happy Easter Monday!',
  '05-04':'Happy May Bank Holiday!','05-25':'Happy Spring Bank Holiday!',
  '08-31':'Happy Summer Bank Holiday!','12-25':'Happy Christmas.','12-26':'Happy Boxing Day!'
};

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

  const todayKey = `${String(new Date().getMonth()+1).padStart(2,'0')}-${String(new Date().getDate()).padStart(2,'0')}`;
  const holidayMsg = UK_HOLIDAYS[todayKey];
  const pendingPayout = myQuotes.filter(q => q.status === 'accepted').reduce((s, q) => s + (q.totalPrice || 0), 0);
  const activeJobsCount = myQuotes.filter(q => q.status === 'accepted').length;
  const completedJobsCount = myQuotes.filter(q => q.status === 'completed' || q.status === 'rejected').length;
  const availableJobsCount = availableJobs.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#FBF7F0' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#D85A30' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#FBF7F0' }}>
      {/* Topbar */}
      <header style={{ background: '#F5F0E8', borderBottom: '0.5px solid rgba(180,150,100,0.2)' }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img
            src="https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png"
            alt="PaintBookCo"
            style={{ height: '24px', width: 'auto' }}
          />
          <span style={{ fontSize: '11px', color: '#B4B2A9' }}>Painter/Decorator Portal</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Greeting */}
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: '#1A1A14', letterSpacing: '-0.01em', fontWeight: 400 }}>
            {getGreeting()}
          </h1>
          <p style={{ fontSize: '11px', color: '#B4B2A9', marginTop: '3px' }}>Here's what's waiting for you today</p>
          {holidayMsg && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(45,90,61,0.06)', border: '0.5px solid rgba(45,90,61,0.18)', borderRadius: '6px', fontSize: '11px', color: '#2D5A3D' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#2D5A3D" strokeWidth="1.2"/><path d="M7 4v3l2 1" stroke="#2D5A3D" strokeWidth="1.2" strokeLinecap="round"/></svg>
              {holidayMsg}
            </div>
          )}
        </div>

        {/* New jobs alert */}
        {availableJobsCount > 0 && (
          <div style={{ background: '#FFF4EF', border: '0.5px solid rgba(216,90,48,0.3)', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: '#D85A30', lineHeight: 1 }}>{availableJobsCount}</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A14', marginBottom: '2px' }}>New jobs near you</p>
              <span style={{ fontSize: '11px', color: '#9E9A8E' }}>View and quote below</span>
            </div>
            <svg style={{ marginLeft: 'auto', color: '#D85A30' }} width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.75 9h10.5M9 3.75L14.25 9 9 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        )}

        {/* Notifications */}
        {unreadCount > 0 && (
          <div style={{ background: 'rgba(26,92,138,0.06)', border: '0.5px solid rgba(26,92,138,0.2)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle className="h-5 w-5" style={{ color: '#1A5C8A' }} />
            <span style={{ fontSize: '13px', color: '#1A5C8A' }}>
              You have {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
          <div style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: '#2D5A3D', lineHeight: 1, marginBottom: '3px' }}>£{pendingPayout.toFixed(0)}</div>
            <div style={{ fontSize: '10px', color: '#B4B2A9' }}>Pending payout</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: '#1A5C8A', lineHeight: 1, marginBottom: '3px' }}>{activeJobsCount}</div>
            <div style={{ fontSize: '10px', color: '#B4B2A9' }}>Active jobs</div>
          </div>
          <div style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '22px', color: '#1A1A14', lineHeight: 1, marginBottom: '3px' }}>{completedJobsCount}</div>
            <div style={{ fontSize: '10px', color: '#B4B2A9' }}>Completed</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-2" style={{ background: 'rgba(180,150,100,0.1)', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '8px' }}>
            <TabsTrigger value="available" style={{ fontSize: '13px', fontWeight: 500 }}>
              Available Jobs ({availableJobs.length})
            </TabsTrigger>
            <TabsTrigger value="quotes" style={{ fontSize: '13px', fontWeight: 500 }}>
              My Quotes ({myQuotes.length})
            </TabsTrigger>
          </TabsList>

          {/* Available Jobs Tab */}
          <TabsContent value="available" className="mt-5 space-y-4">
            {availableJobs.length === 0 ? (
              <div style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '8px', padding: '48px 24px', textAlign: 'center' }}>
                <Briefcase className="mx-auto h-10 w-10 mb-4" style={{ color: '#C4B5A5' }} />
                <p style={{ color: '#9B8A75', marginBottom: '16px' }}>No jobs available in your area right now</p>
                <Button variant="outline" onClick={() => navigate('/painter-onboarding')}>
                  Update Your Profile
                </Button>
              </div>
            ) : (
              availableJobs.map((job) => (
                <div
                  key={job.id}
                  style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '8px', padding: '20px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(216,90,48,0.25)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(216,90,48,0.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(180,150,100,0.18)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <p style={{ fontWeight: 600, color: '#1A1A14', marginBottom: '4px' }}>{job.title}</p>
                      <p className="flex items-center gap-1.5" style={{ fontSize: '13px', color: '#9B8A75' }}>
                        <MapPin className="h-3.5 w-3.5" />
                        {job.postcode}
                      </p>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#FFF4EF', color: '#D85A30', border: '0.5px solid rgba(216,90,48,0.3)', whiteSpace: 'nowrap' }}>{job.jobType}</span>
                  </div>
                  {job.description && (
                    <p style={{ fontSize: '13px', color: '#9B8A75', lineHeight: 1.6, marginBottom: '12px' }}>{job.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {job.budgetMin && (
                      <div>
                        <p style={{ fontSize: '11px', color: '#B4B2A9' }}>Budget</p>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#2D5A3D', marginTop: '2px' }}>
                          £{job.budgetMin}{job.budgetMax && ` – £${job.budgetMax}`}
                        </p>
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: '11px', color: '#B4B2A9' }}>Posted</p>
                      <p style={{ fontWeight: 600, color: '#1A1A14', marginTop: '2px' }}>{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {myQuotes.some((q) => q.jobId === job.id) ? (
                    <button disabled style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, background: 'rgba(45,90,61,0.08)', color: '#2D5A3D', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.7 }}>
                      <CheckCircle2 className="h-4 w-4" />
                      Already Quoted
                    </button>
                  ) : (
                    <button
                      onClick={() => { setSelectedJob(job); setQuoteDialogOpen(true); }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, background: '#D85A30', color: '#F5F0E8', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
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
              <div style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '8px', padding: '48px 24px', textAlign: 'center' }}>
                <Briefcase className="mx-auto h-10 w-10 mb-4" style={{ color: '#C4B5A5' }} />
                <p style={{ color: '#9B8A75' }}>You haven't submitted any quotes yet</p>
              </div>
            ) : (
              myQuotes.map((quote) => {
                const badgeStyle =
                  quote.status === 'accepted'
                    ? { background: '#F0F9F4', color: '#2D5A3D', border: '0.5px solid rgba(45,90,61,0.3)' }
                    : quote.status === 'rejected'
                    ? { background: '#FFF4EF', color: '#D85A30', border: '0.5px solid rgba(216,90,48,0.3)' }
                    : { background: '#EFF6FF', color: '#1A5C8A', border: '0.5px solid rgba(26,92,138,0.25)' };
                return (
                  <div key={quote.id} style={{ background: '#FFFFFF', border: '0.5px solid rgba(180,150,100,0.18)', borderRadius: '8px', padding: '20px' }}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <p style={{ fontWeight: 600, color: '#1A1A14' }}>Quote #{quote.id.slice(0, 8)}</p>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', ...badgeStyle }}>{quote.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p style={{ fontSize: '11px', color: '#B4B2A9' }}>Quote Price</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: '#2D5A3D', marginTop: '2px' }}>£{quote.jobPrice}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: '#B4B2A9' }}>Total Price</p>
                        <p style={{ fontSize: '22px', fontWeight: 700, color: '#2D5A3D', marginTop: '2px' }}>£{quote.totalPrice}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: '#C4B5A5', paddingTop: '10px', borderTop: '0.5px solid rgba(180,150,100,0.15)' }}>
                      Submitted {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                    {quote.status === 'accepted' && (
                      <div style={{ marginTop: '10px', background: 'rgba(45,90,61,0.06)', border: '0.5px solid rgba(45,90,61,0.2)', borderRadius: '6px', padding: '10px 12px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: '#2D5A3D' }}>Quote accepted — ready to start work</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>

      </div>

      {/* Quote Submission Dialog — unchanged */}
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
                Customer budget: £{selectedJob.budgetMin} - £{selectedJob.budgetMax}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQuoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingQuote === selectedJob?.id}>
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
