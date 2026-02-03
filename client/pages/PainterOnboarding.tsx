import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KYCForm } from "@/components/painter/KYCForm";
import { DocumentUpload } from "@/components/painter/DocumentUpload";
import { KYCStatus } from "@/components/painter/KYCStatus";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface KYCStatusData {
  verificationStatus: "pending" | "under_review" | "approved" | "denied";
  idDocuments: number;
  insuranceDocs: number;
  hasInsurance: boolean;
  kycCompletedAt?: string;
  kycRejectionReason?: string;
}

interface UploadedDocument {
  url: string;
  uploadedAt: string;
  expiresAt?: string;
  type: "id_document" | "insurance" | "address_proof";
}

export function PainterOnboarding() {
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<KYCStatusData | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch KYC status on mount
  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        const token = localStorage.getItem("paintbook:token");
        if (!token) {
          navigate("/join-painter");
          return;
        }

        const response = await fetch("/api/kyc/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch KYC status");

        const data = await response.json();
        if (data.success) {
          setKycStatus(data.data);
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error);
        toast.error("Failed to load KYC status");
      } finally {
        setLoading(false);
      }
    };

    fetchKYCStatus();
  }, [navigate]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("paintbook:token");
        if (!token) return;

        const response = await fetch("/api/kyc/documents", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch documents");

        const data = await response.json();
        if (data.success) {
          const allDocs: UploadedDocument[] = [];
          if (data.data.idDocuments)
            allDocs.push(...data.data.idDocuments.map((d: any) => ({ ...d, type: "id_document" })));
          if (data.data.insuranceDocs)
            allDocs.push(...data.data.insuranceDocs.map((d: any) => ({ ...d, type: "insurance" })));
          if (data.data.addressProofDocuments)
            allDocs.push(...data.data.addressProofDocuments.map((d: any) => ({ ...d, type: "address_proof" })));
          setDocuments(allDocs);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    if (!loading) {
      fetchDocuments();
    }
  }, [loading]);

  const handleKYCSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("paintbook:token");
      if (!token) {
        navigate("/join-painter");
        return;
      }

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit KYC");
      }

      const data = await response.json();
      if (data.success) {
        setKycStatus(data.data);
        toast.success("KYC information submitted successfully");
      }
    } catch (error) {
      console.error("Error submitting KYC:", error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentUpload = async (
    documentType: string,
    documentUrl: string,
    expiry?: string
  ) => {
    const token = localStorage.getItem("paintbook:token");
    if (!token) {
      navigate("/join-painter");
      return;
    }

    const response = await fetch("/api/kyc/documents/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        documentType,
        documentUrl,
        documentExpiry: expiry,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload document");
    }

    // Refresh documents list
    const docsResponse = await fetch("/api/kyc/documents", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (docsResponse.ok) {
      const data = await docsResponse.json();
      if (data.success) {
        const allDocs: UploadedDocument[] = [];
        if (data.data.idDocuments)
          allDocs.push(...data.data.idDocuments.map((d: any) => ({ ...d, type: "id_document" })));
        if (data.data.insuranceDocs)
          allDocs.push(...data.data.insuranceDocs.map((d: any) => ({ ...d, type: "insurance" })));
        if (data.data.addressProofDocuments)
          allDocs.push(...data.data.addressProofDocuments.map((d: any) => ({ ...d, type: "address_proof" })));
        setDocuments(allDocs);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading KYC status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Painter Onboarding</h1>
        <p className="text-gray-600 mt-2">
          Complete your KYC verification to start accepting jobs
        </p>
      </div>

      {/* KYC Status */}
      {kycStatus && (
        <div className="mb-8">
          <KYCStatus
            status={kycStatus.verificationStatus}
            completedAt={kycStatus.kycCompletedAt}
            rejectionReason={kycStatus.kycRejectionReason}
            documentsUploaded={kycStatus.idDocuments + kycStatus.insuranceDocs}
            totalDocumentsRequired={3}
          />
        </div>
      )}

      {/* If Approved, Show Success Message */}
      {kycStatus?.verificationStatus === "approved" && (
        <Card className="mb-8 p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✓ Your KYC verification is complete!
          </h3>
          <p className="text-green-800 mb-4">
            You can now browse available jobs, submit quotes, and start earning.
          </p>
          <Button onClick={() => navigate("/find-painter")} className="bg-green-600 hover:bg-green-700">
            Start Accepting Jobs
          </Button>
        </Card>
      )}

      {/* Tabs for Form and Documents */}
      {kycStatus?.verificationStatus !== "approved" && (
        <Tabs defaultValue="information" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="information">Your Information</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="information" className="mt-6">
            <Card className="p-6">
              <KYCForm
                onSubmit={handleKYCSubmit}
                isLoading={submitting}
              />
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            <DocumentUpload
              onUpload={handleDocumentUpload}
              existingDocuments={documents}
              isLoading={false}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
