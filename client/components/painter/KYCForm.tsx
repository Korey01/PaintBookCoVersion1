import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface KYCFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  businessName: string;
  businessRegistration: string;
  businessType: string;
  address: string;
  city: string;
  postcode: string;
  businessPhone: string;
  hasInsurance: boolean;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  insuranceExpiry: string;
}

interface KYCFormProps {
  onSubmit: (data: KYCFormData) => Promise<void>;
  isLoading?: boolean;
}

export function KYCForm({ onSubmit, isLoading = false }: KYCFormProps) {
  const [formData, setFormData] = useState<KYCFormData>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    businessName: "",
    businessRegistration: "",
    businessType: "sole_trader",
    address: "",
    city: "",
    postcode: "",
    businessPhone: "",
    hasInsurance: false,
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiry: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      toast.error("Personal details are required");
      return;
    }

    if (!formData.address || !formData.postcode) {
      toast.error("Address information is required");
      return;
    }

    try {
      await onSubmit(formData);
      toast.success("KYC information submitted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit KYC"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="07700 000000"
            />
          </div>
        </div>
      </Card>

      {/* Business Information Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              placeholder="John's Painting Services"
            />
          </div>
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sole_trader">Sole Trader</option>
              <option value="limited_company">Limited Company</option>
              <option value="partnership">Partnership</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="businessRegistration">
              Business Registration/Company Number
            </Label>
            <Input
              id="businessRegistration"
              name="businessRegistration"
              value={formData.businessRegistration}
              onChange={handleChange}
              placeholder="e.g., 12345678"
            />
          </div>
          <div>
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input
              id="businessPhone"
              name="businessPhone"
              type="tel"
              value={formData.businessPhone}
              onChange={handleChange}
              placeholder="01234 567890"
            />
          </div>
        </div>
      </Card>

      {/* Address Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street"
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City/Town</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="London"
            />
          </div>
          <div>
            <Label htmlFor="postcode">Postcode *</Label>
            <Input
              id="postcode"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              placeholder="SW1A 1AA"
              required
            />
          </div>
        </div>
      </Card>

      {/* Insurance Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="hasInsurance"
              name="hasInsurance"
              type="checkbox"
              checked={formData.hasInsurance}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <Label htmlFor="hasInsurance" className="cursor-pointer">
              I have public liability insurance
            </Label>
          </div>

          {formData.hasInsurance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  name="insuranceProvider"
                  value={formData.insuranceProvider}
                  onChange={handleChange}
                  placeholder="e.g., AXA, Allianz"
                />
              </div>
              <div>
                <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                <Input
                  id="insurancePolicyNumber"
                  name="insurancePolicyNumber"
                  value={formData.insurancePolicyNumber}
                  onChange={handleChange}
                  placeholder="Policy number"
                />
              </div>
              <div>
                <Label htmlFor="insuranceExpiry">Expiry Date</Label>
                <Input
                  id="insuranceExpiry"
                  name="insuranceExpiry"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
          size="lg"
        >
          {isLoading ? "Submitting..." : "Submit KYC Information"}
        </Button>
      </div>

      <p className="text-sm text-gray-600">
        * Required fields. Your information will be reviewed within 24-48 hours.
      </p>
    </form>
  );
}
