import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface KYCStatusProps {
  status: "pending" | "under_review" | "approved" | "denied";
  completedAt?: string;
  rejectionReason?: string;
  documentsUploaded: number;
  totalDocumentsRequired: number;
}

export function KYCStatus({
  status,
  completedAt,
  rejectionReason,
  documentsUploaded,
  totalDocumentsRequired,
}: KYCStatusProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "denied":
        return <XCircle className="w-8 h-8 text-red-500" />;
      case "under_review":
        return <Clock className="w-8 h-8 text-yellow-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "approved":
        return "KYC Verified";
      case "denied":
        return "KYC Rejected";
      case "under_review":
        return "Under Review";
      default:
        return "Pending Submission";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200";
      case "denied":
        return "bg-red-50 border-red-200";
      case "under_review":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "approved":
        return "text-green-800";
      case "denied":
        return "text-red-800";
      case "under_review":
        return "text-yellow-800";
      default:
        return "text-gray-800";
    }
  };

  const progress = (documentsUploaded / totalDocumentsRequired) * 100;

  return (
    <Card className={`p-6 border-2 ${getStatusColor()}`}>
      <div className="flex items-start gap-4">
        <div>{getStatusIcon()}</div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${getTextColor()}`}>
            {getStatusLabel()}
          </h3>

          {/* Status Description */}
          <p className="text-sm mt-2">
            {status === "approved" &&
              "Your KYC verification has been approved. You can now accept jobs and earn from the platform."}
            {status === "denied" &&
              "Your KYC verification was rejected. Please review the reason below and resubmit."}
            {status === "under_review" &&
              "Your KYC information is being reviewed. We typically respond within 24-48 hours."}
            {status === "pending" &&
              "Complete and submit your KYC information to start accepting jobs."}
          </p>

          {/* Rejection Reason */}
          {status === "denied" && rejectionReason && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded">
              <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
              <p className="text-sm text-red-800 mt-1">{rejectionReason}</p>
            </div>
          )}

          {/* Completed Date */}
          {completedAt && (
            <p className="text-xs text-gray-600 mt-3">
              Completed on {new Date(completedAt).toLocaleDateString()}
            </p>
          )}

          {/* Progress Bar */}
          {(status === "pending" || status === "under_review") && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Documents Required</span>
                <span className="text-sm text-gray-600">
                  {documentsUploaded}/{totalDocumentsRequired}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Next Steps */}
          {status === "pending" && (
            <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded">
              <p className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                Next Steps:
              </p>
              <ol className="text-sm text-blue-800 mt-2 space-y-1 ml-6">
                <li>1. Fill in your personal and business information</li>
                <li>2. Upload your ID document</li>
                <li>3. Upload proof of address</li>
                <li>4. (Optional) Upload your insurance certificate</li>
                <li>5. Submit for verification</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
