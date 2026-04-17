import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function B2BFindPainter() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [projectType, setProjectType] = useState("");
  const [numProjects, setNumProjects] = useState("");
  const [description, setDescription] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [multiSite, setMultiSite] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleNext = () => {
    if (step === 1) {
      if (!postcode.trim() && !city.trim()) {
        toast.error("Please enter a postcode or city");
        return;
      }
      if (!projectType) {
        toast.error("Please select a project type");
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (
      !businessName.trim() ||
      !contactPerson.trim() ||
      !phone.trim() ||
      !email.trim()
    ) {
      toast.error("Please fill in all contact details");
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would send to your backend
      const formData = {
        postcode,
        city,
        projectType,
        numProjects,
        description,
        timeline,
        budget,
        multiSite,
        businessName,
        contactPerson,
        phone,
        email,
      };

      // Store in localStorage for demo
      localStorage.setItem("paintbook:b2b-inquiry", JSON.stringify(formData));

      toast.success(
        "Thank you! We'll review your project and call you within 24 hours.",
      );

      // Redirect to confirmation page
      setTimeout(() => {
        navigate("/b2b/confirmation", { state: formData });
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black">
            Find Verified Commercial Painters
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell us about your project and we'll connect you with the right
            painting team, handle pricing, and manage every milestone.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between items-center mb-12">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step === num
                    ? "bg-secondary text-secondary-foreground scale-110"
                    : step > num
                      ? "bg-primary text-primary-foreground"
                      : "bg-border text-muted-foreground"
                }`}
              >
                {step > num ? "✓" : num}
              </div>
              {num < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-all ${step > num ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Project Location & Type"}
              {step === 2 && "Project Details"}
              {step === 3 && "Your Contact Information"}
            </CardTitle>
            <CardDescription>
              {step === 1 &&
                "Where is your project and what type of work do you need?"}
              {step === 2 &&
                "Tell us more about your project scope and timeline."}
              {step === 3 &&
                "Finally, help us get in touch to discuss your project."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Location & Type */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postcode">Postcode</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="postcode"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        placeholder="e.g. M1 1AE"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Manchester"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="project-type">Project Type</Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="project-type" className="mt-2">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">
                        Office / Commercial Space
                      </SelectItem>
                      <SelectItem value="retail">Retail Fit-out</SelectItem>
                      <SelectItem value="residential">
                        Multi-Unit Residential
                      </SelectItem>
                      <SelectItem value="industrial">
                        Industrial / Warehouse
                      </SelectItem>
                      <SelectItem value="hospitality">
                        Hospitality / Hotel
                      </SelectItem>
                      <SelectItem value="maintenance">
                        Ongoing Maintenance
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="num-projects">
                    Number of Sites / Projects
                  </Label>
                  <Select value={numProjects} onValueChange={setNumProjects}>
                    <SelectTrigger id="num-projects" className="mt-2">
                      <SelectValue placeholder="Select number of projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Project</SelectItem>
                      <SelectItem value="2-5">2-5 Projects</SelectItem>
                      <SelectItem value="5-10">5-10 Projects</SelectItem>
                      <SelectItem value="10+">10+ Projects</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Checkbox
                    id="multi-site"
                    checked={multiSite}
                    onCheckedChange={(checked) =>
                      setMultiSite(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="multi-site"
                    className="font-normal cursor-pointer"
                  >
                    This is a multi-site project across different locations
                  </Label>
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the scope of work, specific requirements, surface types, etc."
                    rows={5}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeline">Project Timeline</Label>
                    <Select value={timeline} onValueChange={setTimeline}>
                      <SelectTrigger id="timeline" className="mt-2">
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">
                          ASAP / Next 2 weeks
                        </SelectItem>
                        <SelectItem value="month">Within 1 month</SelectItem>
                        <SelectItem value="quarter">Within 3 months</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="ongoing">
                          Ongoing / Rolling
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="budget">Estimated Budget</Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger id="budget" className="mt-2">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-5k">Under £5,000</SelectItem>
                        <SelectItem value="5-20k">£5,000 - £20,000</SelectItem>
                        <SelectItem value="20-50k">
                          £20,000 - £50,000
                        </SelectItem>
                        <SelectItem value="50-100k">
                          £50,000 - £100,000
                        </SelectItem>
                        <SelectItem value="100k+">£100,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    After you submit, our team will review your project and call
                    you within 24 hours to discuss the scope, pricing, and next
                    steps.
                  </p>
                </div>

                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your company name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input
                    id="contact-person"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Your name"
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone number"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between pt-6 border-t border-border">
              {step > 1 && (
                <Button variant="outline" onClick={handlePrevious} size="lg">
                  Previous
                </Button>
              )}
              <div className="flex-1" />
              {step < 3 && (
                <Button onClick={handleNext} size="lg" className="rounded-full">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === 3 && (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  size="lg"
                  className="rounded-full bg-secondary hover:bg-secondary/90"
                >
                  {loading ? "Submitting..." : "Submit & Get Quote"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3 text-center">
            <div className="flex justify-center mb-3">
              <Building2 className="h-8 w-8 text-secondary" />
            </div>
            <h4 className="font-bold">Verified Teams</h4>
            <p className="text-sm text-muted-foreground">
              All painters are ID verified, insured, and have proven commercial
              experience.
            </p>
          </div>
          <div className="space-y-3 text-center">
            <div className="flex justify-center mb-3">
              <Calendar className="h-8 w-8 text-secondary" />
            </div>
            <h4 className="font-bold">Milestone Management</h4>
            <p className="text-sm text-muted-foreground">
              Track progress and manage payments based on project milestones you
              define.
            </p>
          </div>
          <div className="space-y-3 text-center">
            <div className="flex justify-center mb-3">
              <ShieldCheck className="h-8 w-8 text-secondary" />
            </div>
            <h4 className="font-bold">Escrow Protection</h4>
            <p className="text-sm text-muted-foreground">
              Your funds are protected in escrow until you confirm project
              completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
