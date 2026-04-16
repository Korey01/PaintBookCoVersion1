import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800";

export default function KYCCustomer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [acknowledged, setAcknowledged] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <Link to="/">
          <img src={LOGO} alt="PaintBookCo" className="h-8 object-contain" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="animate-editorial-up" style={{ animationFillMode: "both" }}>
            <p className="editorial-label mb-2">Welcome to PaintBookCo</p>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">
              You're almost ready to book
            </h1>
            <p className="text-muted-foreground">
              To ensure a safe and trustworthy marketplace, we verify all customers
              before they can post jobs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <VerificationStep
                number={1}
                title="Email Verification"
                description="Confirm your email address (check your inbox)"
                completed={true}
              />
              <VerificationStep
                number={2}
                title="Profile Information"
                description="Complete your profile with accurate details"
                completed={false}
              />
              <VerificationStep
                number={3}
                title="Address Verification"
                description="We'll verify your address for job location accuracy"
                completed={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-sm">Why we verify customers</h3>
              <p className="text-xs text-muted-foreground">
                It keeps our painters safe and ensures quality projects in the
                marketplace.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-sm">How long does it take?</h3>
              <p className="text-xs text-muted-foreground">
                Most customers are verified within 24 hours of email confirmation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-xs text-muted-foreground leading-[1.7]">
                I understand that PaintBookCo verifies customers for platform safety.
                I agree to provide accurate information and accept our{" "}
                <a href="/terms" className="text-foreground hover:underline">
                  Terms of Service
                </a>
              </span>
            </label>

            <button
              onClick={() => navigate("/dashboard/customer")}
              disabled={!acknowledged}
              className="w-full bg-foreground text-background py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              Continue to Dashboard
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Questions?{" "}
              <a href="/help" className="text-foreground hover:underline">
                Visit our Help Center
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function VerificationStep({
  number,
  title,
  description,
  completed,
}: {
  number: number;
  title: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className={`flex gap-4 p-4 rounded-lg border ${completed ? "border-green-200 bg-green-50/50" : "border-border"}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${completed ? "bg-green-600 text-white" : "bg-border text-muted-foreground"}`}>
        {completed ? "✓" : number}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium text-sm ${completed ? "text-green-700" : "text-foreground"}`}>
          {title}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
