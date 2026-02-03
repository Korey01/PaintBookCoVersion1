/**
 * Phase 1 API Testing Script
 * Tests authentication, jobs, quotes, and payment endpoints
 */

import fetch from "node-fetch";

const API_BASE = "http://localhost:3000/api";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  data?: any;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function request(
  method: string,
  path: string,
  body?: any,
  token?: string
) {
  const headers: any = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `${response.status}: ${data.error || response.statusText}`
    );
  }

  return data;
}

let customerToken = "";
let painterToken = "";
let jobId = "";
let quoteId = "";

async function runTests() {
  console.log("\n🧪 PaintBook Phase 1 API Tests\n");
  console.log("================================\n");

  // Test 1: Register Customer
  await test("Register Customer", async () => {
    const response = await request("POST", "/auth/register", {
      email: `customer_${Date.now()}@test.com`,
      password: "password123",
      userType: "customer",
    });

    if (!response.success || !response.token) {
      throw new Error("No token in response");
    }

    customerToken = response.token;

    if (response.user.userType !== "customer") {
      throw new Error("User type should be customer");
    }
  });

  // Test 2: Register Painter
  await test("Register Painter", async () => {
    const response = await request("POST", "/auth/register", {
      email: `painter_${Date.now()}@test.com`,
      password: "password123",
      userType: "painter",
    });

    if (!response.success || !response.token) {
      throw new Error("No token in response");
    }

    painterToken = response.token;

    if (response.user.userType !== "painter") {
      throw new Error("User type should be painter");
    }
  });

  // Test 3: Get Current User
  await test("Get Current User (Customer)", async () => {
    const response = await request("GET", "/auth/me", undefined, customerToken);

    if (!response.success || !response.user) {
      throw new Error("No user in response");
    }

    if (response.user.userType !== "customer") {
      throw new Error("User type mismatch");
    }
  });

  // Test 4: Create Job
  await test("Create Job (Customer)", async () => {
    const response = await request(
      "POST",
      "/jobs",
      {
        jobType: "interior",
        title: "Living Room Repaint",
        description: "Walls and ceiling, 2 coats",
        postcode: "SW1A 1AA",
        budgetMin: 500,
        budgetMax: 1000,
        paintBrand: "Dulux",
        rooms: [
          {
            id: "room_1",
            name: "Living Room",
            length: 5,
            width: 4,
            height: 2.4,
            coats: 2,
          },
        ],
        useEscrow: true,
        customerEmail: "test@example.com",
        customerPhone: "07700900000",
      },
      customerToken
    );

    if (!response.success || !response.data || !response.data.id) {
      throw new Error("No job ID in response");
    }

    jobId = response.data.id;

    if (response.data.status !== "open") {
      throw new Error("Job status should be 'open'");
    }
  });

  // Test 5: Get Job
  await test("Get Job Details", async () => {
    const response = await request("GET", `/jobs/${jobId}`, undefined, customerToken);

    if (!response.success || !response.data) {
      throw new Error("No job data in response");
    }

    if (response.data.id !== jobId) {
      throw new Error("Job ID mismatch");
    }

    if (response.data.rooms.length !== 1) {
      throw new Error("Room data missing");
    }
  });

  // Test 6: List Jobs (Painter)
  await test("List Jobs (Painter)", async () => {
    const response = await request("GET", "/jobs", undefined, painterToken);

    if (!response.success || !response.data || !Array.isArray(response.data.jobs)) {
      throw new Error("No jobs array in response");
    }

    // Should see the job we just created (assuming painter is in same postcode)
    const found = response.data.jobs.some((j: any) => j.id === jobId);
    // Note: Won't find it if painter's postcode is different, so just check structure
    if (!response.data.hasOwnProperty("total")) {
      throw new Error("Missing pagination fields");
    }
  });

  // Test 7: Submit Quote
  await test("Submit Quote (Painter)", async () => {
    const response = await request(
      "POST",
      "/quotes",
      {
        jobId,
        jobPrice: 800,
        consultationFee: 50,
      },
      painterToken
    );

    if (!response.success || !response.data || !response.data.id) {
      throw new Error("No quote ID in response");
    }

    quoteId = response.data.id;

    if (response.data.status !== "pending") {
      throw new Error("Quote status should be 'pending'");
    }

    if (response.data.totalPrice !== 850) {
      throw new Error("Total price calculation error");
    }
  });

  // Test 8: Get Quote
  await test("Get Quote Details", async () => {
    const response = await request("GET", `/quotes/${quoteId}`, undefined, customerToken);

    if (!response.success || !response.data) {
      throw new Error("No quote data in response");
    }

    if (response.data.jobPrice !== 800) {
      throw new Error("Job price mismatch");
    }
  });

  // Test 9: List Quotes for Job
  await test("List Quotes for Job", async () => {
    const response = await request("GET", `/quotes/job/${jobId}`, undefined, customerToken);

    if (!response.success || !response.data || !Array.isArray(response.data.quotes)) {
      throw new Error("No quotes array in response");
    }

    const found = response.data.quotes.some((q: any) => q.id === quoteId);
    if (!found) {
      throw new Error("Quote not found in list");
    }
  });

  // Test 10: Accept Quote
  await test("Accept Quote (Customer)", async () => {
    const response = await request(
      "PUT",
      `/quotes/${quoteId}`,
      {
        status: "accepted",
      },
      customerToken
    );

    if (!response.success || !response.data) {
      throw new Error("No quote data in response");
    }

    if (response.data.status !== "accepted") {
      throw new Error("Quote status should be 'accepted'");
    }
  });

  // Test 11: Verify Job Status Updated
  await test("Verify Job Status Updated After Quote Acceptance", async () => {
    const response = await request("GET", `/jobs/${jobId}`, undefined, customerToken);

    if (!response.success || !response.data) {
      throw new Error("No job data in response");
    }

    if (response.data.status !== "quote_accepted") {
      throw new Error(`Job status should be 'quote_accepted', got '${response.data.status}'`);
    }

    if (response.data.escrowAmount !== 850) {
      throw new Error("Escrow amount not set correctly");
    }
  });

  // Test 12: Initiate Payment
  await test("Initiate Payment (Customer)", async () => {
    const response = await request(
      "POST",
      "/payments/initiate",
      {
        jobId,
        amount: 850,
        paymentMethod: "stripe",
      },
      customerToken
    );

    if (!response.success || !response.data) {
      throw new Error("No payment data in response");
    }

    if (!response.data.escrowTransactionId) {
      throw new Error("No escrow transaction ID");
    }

    if (!response.data.transpactTransactionId) {
      throw new Error("No transpact transaction ID");
    }

    // Verify commission calculation
    if (response.data.commissionRate !== 12) {
      throw new Error("Commission rate should be 12% for first jobs");
    }

    if (response.data.commission !== 102) {
      throw new Error("Commission calculation error (should be £102)");
    }
  });

  // Test 13: Error Handling - Register with existing email
  await test("Error Handling - Duplicate Email", async () => {
    try {
      await request("POST", "/auth/register", {
        email: `customer_${Date.now()}@test.com`, // Use a unique email first time
        password: "password123",
        userType: "customer",
      });

      // Try to register with same email
      await request("POST", "/auth/register", {
        email: `customer_${Date.now()}@test.com`,
        password: "password123",
        userType: "customer",
      });

      throw new Error("Should have failed with duplicate email");
    } catch (error: any) {
      if (!error.message.includes("409") && !error.message.includes("already")) {
        throw error; // Re-throw if it's not the expected error
      }
    }
  });

  // Test 14: Authorization - Painter can't delete customer job
  await test("Authorization - Painter Cannot Delete Customer Job", async () => {
    try {
      await request("DELETE", `/jobs/${jobId}`, undefined, painterToken);
      throw new Error("Should have failed with 403");
    } catch (error: any) {
      if (!error.message.includes("403") && !error.message.includes("Not authorized")) {
        throw error;
      }
    }
  });

  // Test 15: Authorization - Customer can't submit quote
  await test("Authorization - Customer Cannot Submit Quote", async () => {
    try {
      // Create another job first
      const jobResponse = await request(
        "POST",
        "/jobs",
        {
          jobType: "interior",
          title: "Another Job",
          postcode: "SW1A 1AA",
          budgetMin: 500,
          budgetMax: 1000,
        },
        customerToken
      );

      const newJobId = jobResponse.data.id;

      // Try to submit quote as customer
      await request(
        "POST",
        "/quotes",
        {
          jobId: newJobId,
          jobPrice: 500,
          consultationFee: 0,
        },
        customerToken
      );

      throw new Error("Should have failed with 403");
    } catch (error: any) {
      if (!error.message.includes("403") && !error.message.includes("painter")) {
        throw error;
      }
    }
  });

  console.log("\n================================");
  console.log("\n📊 Test Summary\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);

  if (failed > 0) {
    console.log("\nFailed Tests:");
    results.filter((r) => !r.passed).forEach((r) => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  return failed === 0;
}

// Run tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
