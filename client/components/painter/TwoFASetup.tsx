import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { QrCode, Copy, CheckCircle, AlertCircle } from "lucide-react";

interface TwoFASetupProps {
  onSetupComplete: () => void;
  isLoading?: boolean;
}

interface SetupData {
  secret: string;
  qrCodeUrl: string;
  instructions: string[];
}

export function TwoFASetup({ onSetupComplete, isLoading = false }: TwoFASetupProps) {
  const [step, setStep] = useState<"start" | "scan" | "verify">("start");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  const handleStartSetup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to setup 2FA");
      }

      const data = await response.json();
      if (data.success) {
        setSetupData(data.data);
        setStep("scan");
        toast.success("2FA secret generated");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to setup 2FA"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret);
      setSecretCopied(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleVerifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/2fa/verify-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Invalid verification code");
      }

      const data = await response.json();
      if (data.success) {
        setStep("verify");
        toast.success("2FA successfully enabled!");
        setTimeout(() => onSetupComplete(), 2000);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Start Setup */}
      {step === "start" && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Enable Two-Factor Authentication
              </h3>
              <p className="text-gray-600 mb-4">
                Protect your account with an extra layer of security. You'll need to enter a code from your authenticator app when you log in.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">
                  What you'll need:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• A smartphone or device with an authenticator app</li>
                  <li>• One of these apps:</li>
                  <li className="ml-6">- Google Authenticator</li>
                  <li className="ml-6">- Microsoft Authenticator</li>
                  <li className="ml-6">- Authy</li>
                  <li className="ml-6">- Any TOTP-compatible app</li>
                </ul>
              </div>
              <Button
                onClick={handleStartSetup}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? "Setting up..." : "Start Setup"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: Scan QR Code */}
      {step === "scan" && setupData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Scan QR Code</h3>

          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
              <img
                src={setupData.qrCodeUrl}
                alt="QR Code for 2FA"
                className="w-48 h-48"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Steps:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Open your authenticator app</li>
                <li>Tap + or "Add Account"</li>
                <li>Scan this QR code</li>
                <li>Or enter the code manually if scanning doesn't work</li>
              </ol>
            </div>

            {/* Secret Code (Manual Entry) */}
            <div>
              <p className="text-sm font-medium mb-2">
                Can't scan? Enter this code manually:
              </p>
              <div className="flex gap-2">
                <code className="flex-1 p-3 bg-gray-100 rounded font-mono text-sm break-all">
                  {setupData.secret}
                </code>
                <Button
                  variant="outline"
                  onClick={handleCopySecret}
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {secretCopied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            {/* Next Step */}
            <Button
              onClick={() => setStep("verify")}
              variant="outline"
              className="w-full"
            >
              I've Scanned the Code
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Verify Code */}
      {step === "verify" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Verify Setup</h3>

          <p className="text-gray-600 mb-4">
            Enter the 6-digit code shown in your authenticator app to confirm 2FA is working correctly.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <Button
              onClick={handleVerifySetup}
              disabled={loading || verificationCode.length !== 6}
              size="lg"
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify & Enable"}
            </Button>

            <Button
              onClick={() => {
                setStep("scan");
                setVerificationCode("");
              }}
              variant="outline"
              className="w-full"
            >
              Back to QR Code
            </Button>
          </div>

          {/* Backup Code Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Save your backup codes somewhere safe. You'll need them if you lose access to your authenticator app.
              </span>
            </p>
          </div>
        </Card>
      )}

      {/* Success State */}
      {step === "verify" && !loading && verificationCode.length === 6 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-green-900">2FA Setup Complete!</h4>
              <p className="text-sm text-green-800 mt-1">
                Your account is now protected with two-factor authentication. You'll be asked to enter a code from your authenticator app when you log in.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
