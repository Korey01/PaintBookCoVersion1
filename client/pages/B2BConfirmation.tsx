import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { SUPPORT_EMAIL } from "@/lib/config";

export default function B2BConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 md:w-20 md:h-20 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12 space-y-4"
        >
          <h1 className="text-4xl sm:text-5xl font-black text-green-900">
            We've Got Your Project!
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Thank you for submitting your commercial painting project. Our team
            is reviewing your details and will contact you within 24 hours to
            discuss next steps.
          </p>
        </motion.div>

        {/* Key Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <Calendar className="h-8 w-8 text-secondary mx-auto" />
              <p className="text-sm text-muted-foreground">Call Within</p>
              <p className="text-lg font-bold">24 Hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <Home className="h-8 w-8 text-secondary mx-auto" />
              <p className="text-sm text-muted-foreground">Project Type</p>
              <p className="text-lg font-bold capitalize">
                {formData?.projectType || "Commercial"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-secondary mx-auto" />
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-bold">In Review</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* What Happens Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-border/50 mb-8">
            <CardHeader>
              <CardTitle>What Happens Next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">We Review Your Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team analyzes your project scope, locations, and
                    requirements to identify the best-fit painters.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">We Call You</h4>
                  <p className="text-sm text-muted-foreground">
                    Our team contacts you within 24 hours to discuss your
                    project in detail and answer any questions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">We Provide a Quote</h4>
                  <p className="text-sm text-muted-foreground">
                    We send you a detailed proposal with pricing, timeline, team
                    information, and escrow protection details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Execute Agreement</h4>
                  <p className="text-sm text-muted-foreground">
                    Once you approve, we execute the project agreement and set
                    up escrow protection for milestone-based payments.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                  5
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Work Begins</h4>
                  <p className="text-sm text-muted-foreground">
                    Your dedicated project manager oversees all work and
                    milestones, keeping you updated throughout.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
        >
          <h3 className="font-bold text-blue-900 mb-3">
            Important: Check Your Email
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            We've sent a confirmation email to{" "}
            <span className="font-semibold">{formData?.email}</span>. Check your
            inbox and spam folder for updates.
          </p>
          <p className="text-sm text-blue-800">
            Questions? Contact us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="underline font-semibold"
            >
              {SUPPORT_EMAIL}
            </a>{" "}
            or call us on your preferred date/time.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
            className="flex-1 rounded-full"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => navigate("/vestimator")}
            size="lg"
            className="flex-1 rounded-full bg-primary hover:bg-primary/90"
          >
            Explore Estimator Tool
          </Button>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 space-y-4"
        >
          <h3 className="text-xl font-bold">Common Questions</h3>
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">
                  How long will the call take?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Most initial consultations take 15-30 minutes. We'll discuss
                  your project scope, answer questions, and explain our process.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">
                  What's included in the proposal?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Detailed breakdown of work, labor costs, materials, timeline,
                  team bios, insurance details, and escrow structure.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">
                  What if I need to reschedule?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Just reply to our confirmation email or call us. We'll find a
                  time that works better for you.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
