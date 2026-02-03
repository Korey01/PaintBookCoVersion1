/**
 * Phase 1 API Integration Tests
 * Tests all major endpoints: Auth, Jobs, Quotes, Payments
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

  const response = await fetch(`${API_URL}${path}`, options);
  return response;
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
let customerToken = "";
let painterToken = "";
let jobId = "";
let quoteId = "";

async function runTests() {
  console.log("🚀 Phase 1 API Integration Tests\n");

  // Test 1: Health Check
  await test("Health Check", async () => {
    const res = await fetch(`${API_URL}/../ping`);
    const data = await res.json();
    return data.message === "pong";
  });

  // Test 2: Register Customer
  await test("Register Customer", async () => {
    const res = await request("POST", "/auth/register", {
      email: `customer-${Date.now()}@test.com`,
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

  // Test 3: Register Painter
  await test("Register Painter", async () => {
    const res = await request("POST", "/auth/register", {
      email: `painter-${Date.now()}@test.com`,
      password: "SecurePass123!",
      userType: "painter",
      fullName: "Jane Professional",
      phone: "07700000002",
    });
    const data = await res.json();
    if (data.token) {
      painterToken = data.token;
      return true;
    }
    return false;
  });

  // Test 4: Get Current User
  await test("Get Current User (Customer)", async () => {
    const res = await request("GET", "/auth/me", undefined, customerToken);
    const data = await res.json();
    return data.user && data.user.email && data.user.userType === "customer";
  });

  // Test 5: Create Job
  await test("Create Paint Job", async () => {
    const res = await request("POST", "/jobs", {
      title: "Living Room Paint Job",
      description: "Paint my living room walls",
      jobType: "interior",
      location: "London, UK",
      postcode: "SW1A 1AA",
      budget: 500,
      rooms: [
        {
          id: "room_1",
          name: "Living Room",
          length: 5,
          width: 4,
          height: 2.8,
          coats: 2,
        },
        {
          id: "room_2",
          name: "Hallway",
          length: 3,
          width: 2,
          height: 2.8,
          coats: 1,
        },
      ],
    }, customerToken);

    const data = await res.json();
    if (data.job && data.job.id) {
      jobId = data.job.id;
      return true;
    }
    console.log("Response:", data);
    return false;
  });

  // Test 6: Get Job Details
  await test("Get Job Details", async () => {
    const res = await request("GET", `/jobs/${jobId}`, undefined, customerToken);
    const data = await res.json();
    return data.job && data.job.title === "Living Room Paint Job";
  });

  // Test 7: List Customer Jobs
  await test("List Customer Jobs", async () => {
    const res = await request("GET", "/jobs?limit=10", undefined, customerToken);
    const data = await res.json();
    return (
      data.jobs &&
      data.jobs.length > 0 &&
      data.jobs.some((j: any) => j.id === jobId)
    );
  });

  // Test 8: List Open Jobs (Painter View)
  await test("List Available Jobs (Painter View)", async () => {
    const res = await request("GET", "/jobs?limit=10", undefined, painterToken);
    const data = await res.json();
    return (
      data.jobs &&
      data.jobs.length > 0 &&
      data.jobs.some((j: any) => j.id === jobId)
    );
  });

  // Test 9: Submit Quote
  await test("Submit Quote (Painter)", async () => {
    const res = await request(
      "POST",
      "/quotes",
      {
        jobId,
        amount: 450,
        description:
          "Professional interior painting service. Includes prep, primer, and 2 coats.",
        timelineWeeks: 2,
      },
      painterToken
    );

    const data = await res.json();
    if (data.quote && data.quote.id) {
      quoteId = data.quote.id;
      return true;
    }
    console.log("Response:", data);
    return false;
  });

  // Test 10: Get Quote Details
  await test("Get Quote Details", async () => {
    const res = await request("GET", `/quotes/${quoteId}`, undefined, customerToken);
    const data = await res.json();
    return data.quote && data.quote.amount === 450;
  });

  // Test 11: List Quotes for Job
  await test("List Quotes for Job", async () => {
    const res = await request("GET", `/quotes/job/${jobId}`, undefined, customerToken);
    const data = await res.json();
    return (
      data.quotes &&
      data.quotes.length > 0 &&
      data.quotes.some((q: any) => q.id === quoteId)
    );
  });

  // Test 12: Accept Quote
  await test("Accept Quote (Customer)", async () => {
    const res = await request(
      "PUT",
      `/quotes/${quoteId}`,
      { decision: "accepted" },
      customerToken
    );

    const data = await res.json();
    return data.quote && data.quote.decision === "accepted";
  });

  // Test 13: Initiate Payment
  await test("Initiate Escrow Payment", async () => {
    const res = await request(
      "POST",
      "/payments/initiate",
      { jobId, amount: 450 },
      customerToken
    );

    const data = await res.json();
    return data.transaction && data.transaction.status === "pending";
  });

  // Test 14: Authorization - Painter Cannot Accept Quote
  await test("Authorization: Painter Cannot Accept Quote", async () => {
    const res = await request(
      "PUT",
      `/quotes/${quoteId}`,
      { decision: "rejected" },
      painterToken
    );

    const data = await res.json();
    // Should be rejected or return error
    return res.status >= 400 || (data.error && data.error.includes("Painters"));
  });

  // Test 15: Authorization - Customer Cannot Submit Quote
  await test("Authorization: Customer Cannot Submit Quote", async () => {
    const res = await request(
      "POST",
      "/quotes",
      {
        jobId,
        amount: 400,
        description: "Test",
        timelineWeeks: 1,
      },
      customerToken
    );

    const data = await res.json();
    return res.status >= 400 || (data.error && data.error.includes("Customers"));
  });

  // Print Results
  console.log("\n" + "=".repeat(50));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log(
      "✅ All Phase 1 tests passed! Your API is working correctly.\n"
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
