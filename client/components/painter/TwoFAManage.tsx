import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Lock, Unlock } from "lucide-react";

interface TwoFAManageProps {
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFAManage({ onStatusChange }: TwoFAManageProps) {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch("/api/2fa/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch 2FA status");

        const data = await response.json();
        if (data.success) {
          setTwoFAEnabled(data.data.twoFAEnabled);
        }
      } catch (error) {
        console.error("Error fetching 2FA status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleDisable = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disable 2FA? This makes your account less secure."
      )
    ) {
      return;
    }

    setDisabling(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: "", // In production, require password
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to disable 2FA");
      }

      const data = await response.json();
      if (data.success) {
        setTwoFAEnabled(false);
        toast.success("2FA has been disabled");
        onStatusChange?.(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to disable 2FA"
      );
    } finally {
      setDisabling(false);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading 2FA status...</p>;
  }

  return (
    <Card
      className={`p-6 border-2 ${
        twoFAEnabled ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {twoFAEnabled ? (
            <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          ) : (
            <Unlock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          )}

          <div>
            <h3
              className={`text-lg font-semibold ${
                twoFAEnabled ? "text-green-900" : "text-yellow-900"
              }`}
            >
              Two-Factor Authentication
            </h3>

            {twoFAEnabled ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-green-800">
                  ✓ Your account is protected with 2FA
                </p>
                <p className="text-sm text-green-700">
                  You'll need to enter a code from your authenticator app when you log in.
                </p>
                <p className="text-xs text-green-600 mt-3">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-yellow-800">
                  Your account is not protected with 2FA
                </p>
                <p className="text-sm text-yellow-700">
                  Enable 2FA to add an extra layer of security to your account.
                </p>
              </div>
            )}
          </div>
        </div>

        {twoFAEnabled && (
          <Button
            variant="outline"
            onClick={handleDisable}
            disabled={disabling}
            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
          >
            {disabling ? "Disabling..." : "Disable"}
          </Button>
        )}
      </div>
    </Card>
  );
}
