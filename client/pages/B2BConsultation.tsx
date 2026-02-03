import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function B2BConsultation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [callDuration, setCallDuration] = useState("30");
  const [projectOverview, setProjectOverview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!contactPerson.trim())
      newErrors.contactPerson = "Contact name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email address";
    if (!preferredDate) newErrors.preferredDate = "Please select a date";
    if (!preferredTime) newErrors.preferredTime = "Please select a time";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        businessName,
        contactPerson,
        phone,
        email,
        preferredDate,
        preferredTime,
        callDuration,
        projectOverview,
        bookedAt: new Date().toISOString(),
      };

      console.log("Consultation booked:", bookingData);

      // Store in localStorage for demo
      localStorage.setItem(
        "paintbook:consultation",
        JSON.stringify(bookingData),
      );

      toast.success("Consultation booked! We'll confirm via email and call.");

      setTimeout(() => {
        navigate("/b2b/consultation-confirmation", { state: bookingData });
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to book consultation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-black">
            Book a Consultation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Talk directly with our team about your commercial painting project.
            We'll discuss your scope, timeline, and budget to find the perfect
            solution.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>Schedule Your Consultation</CardTitle>
                <CardDescription>
                  Pick a time that works for you. Most consultations take 30-45
                  minutes.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company & Contact Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">
                      Your Details
                    </h3>

                    <div>
                      <Label htmlFor="business-name">Business Name *</Label>
                      <Input
                        id="business-name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Your company name"
                        className={`mt-2 ${errors.businessName ? "border-red-500" : ""}`}
                      />
                      {errors.businessName && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.businessName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="contact-person">Contact Person *</Label>
                      <Input
                        id="contact-person"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Your name"
                        className={`mt-2 ${errors.contactPerson ? "border-red-500" : ""}`}
                      />
                      {errors.contactPerson && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.contactPerson}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+44 (0) 123 456 7890"
                          className={`mt-2 ${errors.phone ? "border-red-500" : ""}`}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className={`mt-2 ${errors.email ? "border-red-500" : ""}`}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Time */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="font-semibold text-foreground">
                      Preferred Meeting Time
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date *</Label>
                        <div className="relative mt-2">
                          <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                          <Input
                            id="date"
                            type="date"
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className={`pl-10 ${errors.preferredDate ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.preferredDate && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.preferredDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="time">Time *</Label>
                        <div className="relative mt-2">
                          <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                          <Input
                            id="time"
                            type="time"
                            value={preferredTime}
                            onChange={(e) => setPreferredTime(e.target.value)}
                            className={`pl-10 ${errors.preferredTime ? "border-red-500" : ""}`}
                          />
                        </div>
                        {errors.preferredTime && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.preferredTime}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="duration">Call Duration</Label>
                      <Select
                        value={callDuration}
                        onValueChange={setCallDuration}
                      >
                        <SelectTrigger id="duration" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Project Overview */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="font-semibold text-foreground">
                      Project Overview
                    </h3>

                    <div>
                      <Label htmlFor="overview">
                        Brief Project Description
                      </Label>
                      <Textarea
                        id="overview"
                        value={projectOverview}
                        onChange={(e) => setProjectOverview(e.target.value)}
                        placeholder="Tell us about your project, scope, locations, timeline, and any specific concerns..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-border">
                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-full rounded-full bg-secondary hover:bg-secondary/90"
                    >
                      {loading ? "Booking..." : "Confirm Consultation"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* What to Expect */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Before the Call</h4>
                  <p className="text-muted-foreground">
                    We'll send a confirmation email with meeting details and a
                    link to join the call.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">During the Call</h4>
                  <p className="text-muted-foreground">
                    We'll discuss your project scope, timeline, budget, and
                    specific requirements. We'll also explain our process and
                    escrow protection.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">After the Call</h4>
                  <p className="text-muted-foreground">
                    We'll send you a tailored quote and introduction to your
                    dedicated project manager.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Time Zone Note */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Business Hours</p>
                  <p>
                    We operate Monday-Friday, 9am-6pm GMT. We'll try to
                    accommodate your timezone if you're outside the UK.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features List */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Why Choose Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />
                  <p className="text-muted-foreground">
                    Dedicated project manager for your entire duration
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />
                  <p className="text-muted-foreground">
                    Milestone-based payment with escrow protection
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />
                  <p className="text-muted-foreground">
                    Pre-vetted, experienced commercial painters
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary flex-shrink-0 mt-1.5" />
                  <p className="text-muted-foreground">
                    Multi-site coordination and reporting
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
