/**
 * End-to-End KYC Verification Tests
 * Tests complete painter onboarding workflow including:
 * - Registration
 * - KYC information submission
 * - Document upload
 * - 2FA setup
 * - Job notifications
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const API_URL = "http://localhost:3000/api";
const results: TestResult[] = [];

async function request(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  return fetch(`${API_URL}${path}`, options);
}

async function test(
  name: string,
  fn: () => Promise<boolean>
): Promise<void> {
  try {
    const passed = await fn();
    results.push({ name, passed });
    console.log(passed ? `✓ ${name}` : `✗ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

// Test Data Storage
let painterToken = "";
let painterEmail = "";
let jobId = "";

async function runTests() {
  console.log("🎨 End-to-End KYC & Painter Onboarding Tests\n");

  // ============================================
  // SECTION 1: PAINTER REGISTRATION
  // ============================================
  console.log("📋 Section 1: Painter Registration\n");

  await test("Register Painter", async () => {
    painterEmail = `painter-e2e-${Date.now()}@test.com`;
    const res = await request("POST", "/auth/register", {
      email: painterEmail,
      password: "SecurePass123!",
      userType: "painter",
      fullName: "Jane Professional",
      phone: "07700000002",
    });

    const data = await res.json();
    if (!res.ok) {
      console.log("Response status:", res.status);
      console.log("Error response:", JSON.stringify(data, null, 2));
    }
    if (data.token) {
      painterToken = data.token;
      return true;
    }
    return false;
  });

  await test("Verify Painter Profile Created", async () => {
    const res = await request("GET", "/auth/me", undefined, painterToken);
    const data = await res.json();
    return (
      data.data &&
      data.data.user &&
      data.data.user.userType === "painter" &&
      data.data.user.painterProfile
    );
  });

  // ============================================
  // SECTION 2: KYC INFORMATION SUBMISSION
  // ============================================
  console.log("\n📝 Section 2: KYC Information Submission\n");

  await test("Check Initial KYC Status (Pending)", async () => {
    const res = await request("GET", "/kyc/status", undefined, painterToken);
    const data = await res.json();
    return (
      data.success &&
      data.data.verificationStatus === "pending"
    );
  });

  await test("Submit KYC Information", async () => {
    const res = await request(
      "POST",
      "/kyc/submit",
      {
        firstName: "Jane",
        lastName: "Smith",
        dateOfBirth: "1990-05-15",
        phone: "07700123456",
        businessName: "Jane's Professional Painting",
        businessType: "sole_trader",
        address: "123 Main Street",
        city: "London",
        postcode: "SW1A 1AA",
        businessPhone: "01234567890",
        hasInsurance: true,
        insuranceProvider: "AXA",
        insurancePolicyNumber: "POL123456",
        insuranceExpiry: "2026-12-31",
      },
      painterToken
    );

    const data = await res.json();
    if (!data.success || data.data.verificationStatus !== "under_review") {
      console.log("Submit KYC Response:", JSON.stringify(data, null, 2));
    }
    return data.success && data.data.verificationStatus === "under_review";
  });

  await test("Verify KYC Status Updated (Under Review)", async () => {
    const res = await request("GET", "/kyc/status", undefined, painterToken);
    const data = await res.json();
    return (
      data.success &&
      data.data.verificationStatus === "under_review"
    );
  });

  // ============================================
  // SECTION 3: DOCUMENT UPLOAD
  // ============================================
  console.log("\n📄 Section 3: Document Upload\n");

  await test("Upload ID Document", async () => {
    const res = await request(
      "POST",
      "/kyc/documents/upload",
      {
        documentType: "id_document",
        documentUrl: "https://example.com/id.pdf",
        documentExpiry: "2030-12-31",
      },
      painterToken
    );

    const data = await res.json();
    return data.success && data.data.documentCount === 1;
  });

  await test("Upload Insurance Document", async () => {
    const res = await request(
      "POST",
      "/kyc/documents/upload",
      {
        documentType: "insurance",
        documentUrl: "https://example.com/insurance.pdf",
        documentExpiry: "2026-12-31",
      },
      painterToken
    );

    const data = await res.json();
    return data.success && data.data.documentCount === 1;
  });

  await test("Upload Address Proof Document", async () => {
    const res = await request(
      "POST",
      "/kyc/documents/upload",
      {
        documentType: "address_proof",
        documentUrl: "https://example.com/address.pdf",
      },
      painterToken
    );

    const data = await res.json();
    return data.success && data.data.documentCount === 1;
  });

  await test("Retrieve Uploaded Documents", async () => {
    const res = await request(
      "GET",
      "/kyc/documents",
      undefined,
      painterToken
    );

    const data = await res.json();
    return (
      data.success &&
      data.data.idDocuments &&
      data.data.idDocuments.length > 0 &&
      data.data.insuranceDocs &&
      data.data.insuranceDocs.length > 0 &&
      data.data.addressProofDocuments &&
      data.data.addressProofDocuments.length > 0
    );
  });

  // ============================================
  // SECTION 4: TWO-FACTOR AUTHENTICATION
  // ============================================
  console.log("\n🔐 Section 4: Two-Factor Authentication\n");

  await test("Check 2FA Status (Initially Disabled)", async () => {
    const res = await request("GET", "/2fa/status", undefined, painterToken);
    const data = await res.json();
    return data.success && data.data.twoFAEnabled === false;
  });

  let twoFASecret = "";
  await test("Setup 2FA - Generate Secret", async () => {
    const res = await request("POST", "/2fa/setup", undefined, painterToken);
    const data = await res.json();
    if (data.success && data.data.secret) {
      twoFASecret = data.data.secret;
      return (
        data.data.qrCodeUrl &&
        data.data.instructions &&
        data.data.instructions.length > 0
      );
    }
    return false;
  });

  await test("Verify 2FA Setup with Code", async () => {
    // Accept any 6-digit code for MVP
    const res = await request(
      "POST",
      "/2fa/verify-setup",
      {
        code: "123456", // Mock code
      },
      painterToken
    );

    const data = await res.json();
    return data.success && data.data.twoFAEnabled === true;
  });

  await test("Confirm 2FA Status (Enabled)", async () => {
    const res = await request("GET", "/2fa/status", undefined, painterToken);
    const data = await res.json();
    return data.success && data.data.twoFAEnabled === true;
  });

  // ============================================
  // SECTION 5: JOB CREATION & NOTIFICATIONS
  // ============================================
  console.log("\n🔔 Section 5: Job Creation & Notifications\n");

  // Create customer account
  let customerToken = "";
  await test("Register Customer for Job", async () => {
    const res = await request("POST", "/auth/register", {
      email: `customer-e2e-${Date.now()}@test.com`,
      password: "SecurePass123!",
      userType: "customer",
      fullName: "John Homeowner",
      phone: "07700000001",
    });

    const data = await res.json();
    if (data.token) {
      customerToken = data.token;
      return true;
    }
    return false;
  });

  await test("Create Job (Should Notify Painters)", async () => {
    const res = await request(
      "POST",
      "/jobs",
      {
        title: "Living Room Painting",
        description: "Paint living room walls",
        jobType: "interior",
        postcode: "SW1A 1AA",
        budgetMin: 400,
        budgetMax: 600,
        rooms: [
          {
            id: "room_1",
            name: "Living Room",
            length: 5,
            width: 4,
            height: 2.8,
            coats: 2,
          },
        ],
      },
      customerToken
    );

    const data = await res.json();
    if (data.data && data.data.id) {
      jobId = data.data.id;
      return true;
    }
    return false;
  });

  await test("Painter Receives Job Notification", async () => {
    const res = await request(
      "GET",
      "/notifications?type=job_available",
      undefined,
      painterToken
    );

    const data = await res.json();
    return (
      data.success &&
      data.data.notifications &&
      data.data.notifications.length > 0 &&
      data.data.notifications.some((n: any) => n.jobId === jobId)
    );
  });

  await test("Get Unread Notification Count", async () => {
    const res = await request(
      "GET",
      "/notifications/unread",
      undefined,
      painterToken
    );

    const data = await res.json();
    return data.success && data.data.unreadCount >= 1;
  });

  // ============================================
  // SECTION 6: JOB WORKFLOW
  // ============================================
  console.log("\n📋 Section 6: Job Workflow\n");

  let quoteId = "";
  await test("Painter Submits Quote", async () => {
    const res = await request(
      "POST",
      "/quotes",
      {
        jobId,
        jobPrice: 500,
        consultationFee: 0,
      },
      painterToken
    );

    const data = await res.json();
    if (data.data && data.data.id) {
      quoteId = data.data.id;
      return true;
    }
    return false;
  });

  await test("Customer Accepts Quote", async () => {
    const res = await request(
      "PUT",
      `/quotes/${quoteId}`,
      { status: "accepted" },
      customerToken
    );

    const data = await res.json();
    return data.success && data.data.status === "accepted";
  });

  await test("Job Status Updated to Quote Accepted", async () => {
    const res = await request(
      "GET",
      `/jobs/${jobId}`,
      undefined,
      customerToken
    );

    const data = await res.json();
    return data.data && data.data.status === "quote_accepted";
  });

  // ============================================
  // RESULTS
  // ============================================
  console.log("\n" + "=".repeat(60));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)\n`);

  if (passed === total) {
    console.log(
      "✅ All KYC E2E tests passed! Painter onboarding workflow is working correctly.\n"
    );
  } else {
    console.log("❌ Some tests failed. Review the errors above.\n");
    results.forEach((r) => {
      if (!r.passed) {
        console.log(`  - ${r.name}${r.error ? `: ${r.error}` : ""}`);
      }
    });
  }

  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(console.error);
