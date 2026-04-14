import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isLogin = params.get("type") === "login";
  const userType = (params.get("role") as "painter" | "customer") || "customer";

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [postcode, setPostcode] = useState("");

  // Validation schema
  const ukPostcode = /^(?:[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/i;

  const loginSchema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(1, "Enter your password"),
  });

  const signupSchema = z
    .object({
      email: z.string().email("Enter a valid email"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm your password"),
      postcode:
        userType === "painter"
          ? z.string().regex(ukPostcode, "Use UK format e.g. M1 1AE")
          : z.string().optional(),
    })
    .refine((v) => v.password === v.confirmPassword, {
      message: "Passwords must match",
      path: ["confirmPassword"],
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (isLogin) {
        // Login
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const newErrors: Record<string, string> = {};
          result.error.issues.forEach((issue) => {
            newErrors[issue.path[0] as string] = issue.message;
          });
          setErrors(newErrors);
          return;
        }

        setIsLoading(true);
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({
            form: data.error || "Login failed. Please try again.",
          });
          toast.error("Login failed");
          return;
        }

        // Store token and user
        localStorage.setItem("paintbook:token", data.token);
        localStorage.setItem("paintbook:user", JSON.stringify(data.user));

        toast.success("Welcome back!");

        // Redirect based on user type
        if (data.user.userType === "painter") {
          navigate("/painter-dashboard");
        } else {
          navigate("/customer-dashboard");
        }
      } else {
        // For painter signup, redirect to dedicated JoinPainter page
        if (userType === "painter") {
          navigate("/join-painter");
          return;
        }

        // Signup for customers
        const result = signupSchema.safeParse({
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
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            userType: "customer",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({
            email:
              data.error === "Email already in use"
                ? "This email is already registered"
                : data.error || "Signup failed",
          });
          toast.error("Signup failed");
          return;
        }

        // Store token and user
        localStorage.setItem("paintbook:token", data.token);
        localStorage.setItem("paintbook:user", JSON.stringify(data.user));

        toast.success("Account created successfully!");

        navigate("/customer-dashboard");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({
        form: "Something went wrong. Please try again.",
      });
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl hover-lift">
        <CardHeader className="space-y-4">
          <CardTitle>
            {isLogin
              ? userType === "painter"
                ? "Welcome Back"
                : "Sign In"
              : userType === "painter"
                ? "Join as a Painter"
                : "Create Your Account"}
          </CardTitle>
          <CardDescription className="text-base">
            {isLogin
              ? "Welcome back! Sign in to continue."
              : userType === "painter"
                ? "Get started with PaintBookco. No subscription required."
                : "Create a customer account to post painting jobs."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errors.form && (
            <div className="mb-6 flex gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
              <p className="text-sm text-red-900 leading-relaxed">
                {errors.form}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
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
            )}

            {/* Postcode (Painters only) */}
            {!isLogin && userType === "painter" && (
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
                <p className="mt-1 text-xs text-slate-500">
                  We'll use this to match you with nearby jobs
                </p>
              </div>
            )}

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
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {/* Toggle Link */}
            <div className="text-center text-sm pt-2">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <a
                    href={`/auth?role=${userType}`}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors link-smooth"
                  >
                    Sign up
                  </a>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <a
                    href={`/auth?type=login&role=${userType}`}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors link-smooth"
                  >
                    Sign in
                  </a>
                </>
              )}
            </div>

            {/* Role Switch */}
            <div className="pt-6 border-t border-border/50 text-center text-sm">
              <p className="text-muted-foreground mb-3">
                Or choose another role
              </p>
              {userType === "painter" ? (
                <a
                  href="/auth?role=customer"
                  className="inline-block px-4 py-2 rounded-full border border-border/50 text-sm font-medium hover:bg-primary/5 transition-colors"
                >
                  Post a Job as Customer
                </a>
              ) : (
                <a
                  href="/auth?role=painter"
                  className="inline-block px-4 py-2 rounded-full border border-border/50 text-sm font-medium hover:bg-primary/5 transition-colors"
                >
                  Get Jobs as Painter
                </a>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
