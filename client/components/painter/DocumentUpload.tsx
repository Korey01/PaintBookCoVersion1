import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, CheckCircle, File } from "lucide-react";

interface UploadedDocument {
  url: string;
  uploadedAt: string;
  expiresAt?: string;
  type: "id_document" | "insurance" | "address_proof";
}

interface DocumentUploadProps {
  onUpload: (
    documentType: string,
    documentUrl: string,
    expiry?: string,
  ) => Promise<void>;
  existingDocuments?: UploadedDocument[];
  isLoading?: boolean;
}

const DOCUMENT_TYPES = [
  {
    id: "id_document",
    label: "ID Document",
    description: "Passport or Driving License",
    requiresExpiry: true,
  },
  {
    id: "insurance",
    label: "Insurance Certificate",
    description: "Public Liability Insurance",
    requiresExpiry: true,
  },
  {
    id: "address_proof",
    label: "Address Proof",
    description: "Utility bill or council tax",
    requiresExpiry: false,
  },
];

export function DocumentUpload({
  onUpload,
  existingDocuments = [],
  isLoading = false,
}: DocumentUploadProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const getDocumentsByType = (type: string) => {
    return existingDocuments.filter((doc) => doc.type === type);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !selectedFile) {
      toast.error("Please select a document type and file");
      return;
    }

    const docType = DOCUMENT_TYPES.find((t) => t.id === selectedType);
    if (docType?.requiresExpiry && !expiryDate) {
      toast.error("Expiry date is required for this document");
      return;
    }

    setUploading(true);
    try {
      // In a real app, you would upload to a cloud storage service
      // For now, we'll create a mock URL
      const documentUrl = URL.createObjectURL(selectedFile);

      await onUpload(selectedType, documentUrl, expiryDate || undefined);

      setSelectedFile(null);
      setExpiryDate("");
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Documents</h3>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Document Type Selection */}
          <div>
            <Label>Document Type *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {DOCUMENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedType === type.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="text-xs text-gray-600">
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file">Select File *</Label>
            <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                className="hidden"
              />
              <label
                htmlFor="file"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-sm font-medium">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to upload or drag and drop"}
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 5MB
                </div>
              </label>
            </div>
          </div>

          {/* Expiry Date (if required) */}
          {selectedType &&
            DOCUMENT_TYPES.find((t) => t.id === selectedType)
              ?.requiresExpiry && (
              <div>
                <Label htmlFor="expiry">Expiry Date *</Label>
                <input
                  id="expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

          {/* Upload Button */}
          <Button
            type="submit"
            disabled={uploading || !selectedFile || !selectedType}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
      </Card>

      {/* Uploaded Documents Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>

        {existingDocuments.length === 0 ? (
          <p className="text-gray-600 text-sm">No documents uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {DOCUMENT_TYPES.map((type) => {
              const docs = getDocumentsByType(type.id);
              if (docs.length === 0) return null;

              return (
                <div key={type.id}>
                  <h4 className="font-medium text-sm mb-2">{type.label}</h4>
                  <div className="space-y-2">
                    {docs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="text-sm font-medium">
                              {type.label}
                            </div>
                            <div className="text-xs text-gray-600">
                              Uploaded:{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                              {doc.expiresAt &&
                                ` • Expires: ${new Date(doc.expiresAt).toLocaleDateString()}`}
                            </div>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Requirements */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <File className="w-4 h-4" /> Document Requirements
        </h4>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Valid ID document (Passport or Driving License)</li>
          <li>• Proof of address (not older than 3 months)</li>
          <li>• Public Liability Insurance certificate (recommended)</li>
          <li>• All documents must be clear and readable</li>
        </ul>
      </Card>
    </div>
  );
}
