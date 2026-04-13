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

export default function JoinPainter() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [postcode, setPostcode] = useState("");

  // Validation schema
  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;
  const schema = z
    .object({
      email: z.string().email("Enter a valid email"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm your password"),
      postcode: z.string().regex(ukPostcode, "Use UK format e.g. M1 1AE"),
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
      postcode,
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
      // Call the new API endpoint for painter registration
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          userType: "painter",
          postcode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Email already in use") {
          setErrors({ email: "This email is already registered" });
        } else {
          toast({
            title: "Registration failed",
            description: data.error || "Something went wrong",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      // Store token
      if (data.token) {
        localStorage.setItem("paintbook:token", data.token);
        localStorage.setItem("paintbook:user", JSON.stringify(data.user));

        toast({
          title: "Account created",
          description: "Welcome to PaintBookco! Let's complete your profile.",
        });

        // Redirect to painter onboarding (KYC)
        navigate("/painter-onboarding");
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
