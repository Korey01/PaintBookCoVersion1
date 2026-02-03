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
import { useWebSocketNotifications } from "@/hooks/useWebSocketNotifications";

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
  const { notifications, unreadCount } = useWebSocketNotifications();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:py-12 md:px-6">
      {/* Header */}
      <div className="mb-12 space-y-3">
        <h1>Painter Dashboard</h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Browse available jobs and manage your quotes
        </p>
      </div>

      {/* Notifications Badge */}
      {unreadCount > 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="text-blue-900">
                  You have {unreadCount} new notification
                  {unreadCount !== 1 ? "s" : ""}
                </span>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            Available Jobs ({availableJobs.length})
          </TabsTrigger>
          <TabsTrigger value="quotes">
            My Quotes ({myQuotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Available Jobs Tab */}
        <TabsContent value="available" className="mt-6 space-y-4">
          {availableJobs.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  No jobs available in your area right now
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/painter-onboarding")}
                >
                  Update Your Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            availableJobs.map((job) => (
              <Card key={job.id} className="hover-lift">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription className="mt-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        {job.postcode}
                      </CardDescription>
                    </div>
                    <Badge className="ml-4">{job.jobType}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {job.description && (
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {job.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                      {job.budgetMin && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Budget
                          </p>
                          <p className="text-lg font-bold mt-1">
                            £{job.budgetMin}
                            {job.budgetMax && ` - £${job.budgetMax}`}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Posted
                        </p>
                        <p className="font-semibold text-lg mt-1">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Check if already quoted */}
                    {myQuotes.some((q) => q.jobId === job.id) ? (
                      <Button disabled className="w-full">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Already Quoted
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setQuoteDialogOpen(true);
                        }}
                        className="w-full"
                      >
                        Submit Quote
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* My Quotes Tab */}
        <TabsContent value="quotes" className="mt-6 space-y-4">
          {myQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">
                  You haven't submitted any quotes yet
                </p>
              </CardContent>
            </Card>
          ) : (
            myQuotes.map((quote) => (
              <Card key={quote.id} className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle>Quote #{quote.id.slice(0, 8)}</CardTitle>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Quote Price
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold mt-2">
                          £{quote.jobPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Price
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold mt-2">
                          £{quote.totalPrice}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground pt-2 border-t border-border/50">
                      Submitted on{" "}
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </div>
                    {quote.status === "accepted" && (
                      <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                        <p className="text-sm text-green-900 font-semibold">
                          ✓ Quote accepted! Ready to start work
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

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
