import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";

interface KYCReviewCardProps {
  painterId: string;
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  postcode: string;
  documentsCount: {
    idDocs: number;
    insuranceDocs: number;
    addressProof: number;
  };
  submittedAt: string;
  onReview: (painterId: string) => void;
  onApprove: (painterId: string) => void;
  onReject: (painterId: string) => void;
}

export function KYCReviewCard({
  painterId,
  email,
  firstName,
  lastName,
  businessName,
  postcode,
  documentsCount,
  submittedAt,
  onReview,
  onApprove,
  onReject,
}: KYCReviewCardProps) {
  const totalDocs =
    documentsCount.idDocs +
    documentsCount.insuranceDocs +
    documentsCount.addressProof;
  const requiredDocs = 3; // ID + Insurance + Address
  const docsComplete = totalDocs >= requiredDocs;

  const submittedDate = new Date(submittedAt).toLocaleDateString();
  const daysAgo = Math.floor(
    (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {firstName} {lastName}
          </h3>
          {businessName && (
            <p className="text-sm text-gray-600">{businessName}</p>
          )}
          <p className="text-sm text-gray-600">{email}</p>
        </div>
        <Badge
          variant="outline"
          className="text-amber-700 border-amber-300 bg-amber-50"
        >
          Pending Review
        </Badge>
      </div>

      {/* Location & Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-600">Postcode</p>
          <p className="font-medium">{postcode}</p>
        </div>
        <div>
          <p className="text-gray-600">Submitted</p>
          <p className="font-medium">
            {submittedDate}
            {daysAgo > 0 && (
              <span className="text-xs text-gray-500"> ({daysAgo}d ago)</span>
            )}
          </p>
        </div>
      </div>

      {/* Documents Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </p>
          <p className="text-sm font-medium">
            {totalDocs}/{requiredDocs}
          </p>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>ID Document:</span>
            <span
              className={
                documentsCount.idDocs > 0 ? "text-green-600" : "text-gray-500"
              }
            >
              {documentsCount.idDocs > 0
                ? `✓ ${documentsCount.idDocs}`
                : "✗ Missing"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Insurance:</span>
            <span
              className={
                documentsCount.insuranceDocs > 0
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              {documentsCount.insuranceDocs > 0
                ? `✓ ${documentsCount.insuranceDocs}`
                : "✗ Missing"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Address Proof:</span>
            <span
              className={
                documentsCount.addressProof > 0
                  ? "text-green-600"
                  : "text-gray-500"
              }
            >
              {documentsCount.addressProof > 0
                ? `✓ ${documentsCount.addressProof}`
                : "✗ Missing"}
            </span>
          </div>
        </div>
      </div>

      {/* Status & Warnings */}
      {!docsComplete && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900">
            Documents incomplete - painter should upload remaining docs
          </p>
        </div>
      )}

      {docsComplete && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-900">
            All required documents uploaded - ready for review
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onReview(painterId)}
          className="flex-1"
        >
          Review Details
        </Button>
        <Button
          variant="default"
          onClick={() => onApprove(painterId)}
          disabled={!docsComplete}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => onReject(painterId)}
          className="flex-1"
        >
          Reject
        </Button>
      </div>
    </Card>
  );
}
