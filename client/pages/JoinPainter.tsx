import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SPECIALISMS = [
  "Kitchens",
  "Cabinets",
  "Wallpaper",
  "Interior Walls",
  "Exterior Walls",
  "Doors",
  "Trim",
  "Ceilings",
  "Bathrooms",
  "Feature Walls",
];

export default function JoinPainter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [selectedSpecialisms, setSelectedSpecialisms] = useState<string[]>([]);
  const [serviceRadius, setServiceRadius] = useState("15");

  // Validation schema
  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;
  const ukPhone = /^(?:\+44\s?7\d{3}|(?:0)7\d{3})\s?\d{3}\s?\d{3}$/;
  const schema = z
    .object({
      email: z.string().email("Enter a valid email"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm your password"),
      firstName: z.string().min(2, "First name is required"),
      lastName: z.string().min(2, "Last name is required"),
      phone: z.string().regex(ukPhone, "Enter a valid UK phone number"),
      postcode: z.string().regex(ukPostcode, "Use UK format e.g. M1 1AE"),
      selectedSpecialisms: z.array(z.string()).min(1, "Select at least one specialism"),
      serviceRadius: z.string().min(1, "Service radius is required"),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: "Passwords must match",
      path: ["confirmPassword"],
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = schema.safeParse({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      postcode,
      selectedSpecialisms,
      serviceRadius,
    });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Call the Supabase Edge Function for painter registration
      const response = await fetch(
        "https://kvuidnkmxqftbmlyvlyl.supabase.co/functions/v1/register-painter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            phone,
            specialisms: selectedSpecialisms,
            service_radius_km: parseInt(serviceRadius),
            postcode,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Registration successful!",
          description:
            "Please check your email to confirm your account before logging in.",
        });
        navigate("/login");
      } else {
        toast({
          title: "Registration failed",
          description: data.error || "Registration failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mx-auto max-w-md px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-normal text-foreground">
            Join as a Painter
          </h1>
          <p className="mt-2 text-muted-foreground">
            Get access to nearby painting jobs in your area
          </p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Registration is free. No subscription required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  disabled={isLoading}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  disabled={isLoading}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  disabled={isLoading}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  disabled={isLoading}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07700 900000"
                  disabled={isLoading}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Postcode */}
              <div>
                <Label htmlFor="postcode">Work postcode</Label>
                <Input
                  id="postcode"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. M1 1AE"
                  disabled={isLoading}
                  className={errors.postcode ? "border-red-500" : ""}
                />
                {errors.postcode && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.postcode}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  We'll use this to match you with nearby jobs
                </p>
              </div>

              {/* Specialisms */}
              <div>
                <Label>Specialisms</Label>
                <p className="mt-1 text-xs text-muted-foreground mb-2">
                  Select the areas you specialize in
                </p>
                <div className="space-y-2 border rounded-md p-3 bg-muted/30">
                  {SPECIALISMS.map((spec) => (
                    <label
                      key={spec}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSpecialisms.includes(spec)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSpecialisms([
                              ...selectedSpecialisms,
                              spec,
                            ]);
                          } else {
                            setSelectedSpecialisms(
                              selectedSpecialisms.filter((s) => s !== spec)
                            );
                          }
                        }}
                        disabled={isLoading}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{spec}</span>
                    </label>
                  ))}
                </div>
                {errors.selectedSpecialisms && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.selectedSpecialisms}
                  </p>
                )}
              </div>

              {/* Service Radius */}
              <div>
                <Label htmlFor="serviceRadius">Service radius (km)</Label>
                <Select value={serviceRadius} onValueChange={setServiceRadius}>
                  <SelectTrigger
                    id="serviceRadius"
                    disabled={isLoading}
                    className={errors.serviceRadius ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 km</SelectItem>
                    <SelectItem value="10">10 km</SelectItem>
                    <SelectItem value="15">15 km</SelectItem>
                    <SelectItem value="20">20 km</SelectItem>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="30">30 km</SelectItem>
                    <SelectItem value="40">40 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceRadius && (
                  <p className="mt-1 flex items-center text-sm text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {errors.serviceRadius}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  How far are you willing to travel for jobs?
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Continue to verification
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a
                  href="/auth?type=login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign in
                </a>
              </div>
            </form>

            {/* Info Box */}
            <div className="mt-6 border border-primary/15 bg-primary/5 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-primary" />
                <div className="text-sm text-foreground">
                  <p className="font-semibold">What happens next?</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• Complete your KYC verification</li>
                    <li>• Upload required documents (ID, insurance)</li>
                    <li>• Get approved to access jobs</li>
                    <li>• Earn money with every completed job</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>No credit card required · Free to join · Secure registration</p>
        </div>
      </div>
    </motion.div>
  );
}

export function JoinPainterComplete() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-md px-4 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 font-display text-3xl font-normal text-foreground">
          Profile complete!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your account is verified and ready. Start browsing nearby jobs.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={() => navigate("/dashboard")} size="lg">
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/find-painters")}
            size="lg"
          >
            Browse Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}
