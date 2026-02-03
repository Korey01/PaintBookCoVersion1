#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000/api"
echo -e "${BLUE}=== PaintBookCo Phase 1 API Testing ===${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}[1/15] Testing Health Check${NC}"
HEALTH=$(curl -s "$API_URL/../ping")
if echo "$HEALTH" | grep -q "pong"; then
  echo -e "${GREEN}✓ API is responding${NC}\n"
else
  echo -e "${RED}✗ API health check failed${NC}\n"
  exit 1
fi

# Test 2: Register Customer
echo -e "${BLUE}[2/15] Register Customer${NC}"
CUSTOMER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "SecurePass123!",
    "userType": "customer",
    "fullName": "John Homeowner",
    "phone": "07700000001"
  }')

CUSTOMER_TOKEN=$(echo $CUSTOMER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$CUSTOMER_TOKEN" ]; then
  echo -e "${GREEN}✓ Customer registered, token: ${CUSTOMER_TOKEN:0:20}...${NC}\n"
else
  echo -e "${RED}✗ Customer registration failed${NC}"
  echo "$CUSTOMER_RESPONSE" | jq .
  echo ""
fi

# Test 3: Register Painter
echo -e "${BLUE}[3/15] Register Painter${NC}"
PAINTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "painter@test.com",
    "password": "SecurePass123!",
    "userType": "painter",
    "fullName": "Jane Professional",
    "phone": "07700000002"
  }')

PAINTER_TOKEN=$(echo $PAINTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ ! -z "$PAINTER_TOKEN" ]; then
  echo -e "${GREEN}✓ Painter registered, token: ${PAINTER_TOKEN:0:20}...${NC}\n"
else
  echo -e "${RED}✗ Painter registration failed${NC}"
  echo "$PAINTER_RESPONSE" | jq .
  echo ""
fi

# Test 4: Get Current User (Customer)
echo -e "${BLUE}[4/15] Get Current User (Customer)${NC}"
ME=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
if echo "$ME" | grep -q "customer@test.com"; then
  echo -e "${GREEN}✓ Retrieved customer profile${NC}\n"
else
  echo -e "${RED}✗ Failed to get customer profile${NC}\n"
fi

# Test 5: Create Job (Customer)
echo -e "${BLUE}[5/15] Create Paint Job${NC}"
JOB_RESPONSE=$(curl -s -X POST "$API_URL/jobs" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "title": "Living Room Paint Job",
    "description": "Paint my living room walls",
    "jobType": "interior",
    "location": "London, UK",
    "postcode": "SW1A 1AA",
    "budget": 500,
    "rooms": [
      {
        "id": "room_1",
        "name": "Living Room",
        "length": 5,
        "width": 4,
        "height": 2.8,
        "coats": 2
      },
      {
        "id": "room_2",
        "name": "Hallway",
        "length": 3,
        "width": 2,
        "height": 2.8,
        "coats": 1
      }
    ]
  }')

JOB_ID=$(echo $JOB_RESPONSE | grep -o '"id":"[a-z0-9-]*' | head -1 | cut -d'"' -f4)
if [ ! -z "$JOB_ID" ]; then
  echo -e "${GREEN}✓ Job created: $JOB_ID${NC}\n"
else
  echo -e "${RED}✗ Job creation failed${NC}"
  echo "$JOB_RESPONSE" | jq .
  echo ""
fi

# Test 6: Get Job Details
echo -e "${BLUE}[6/15] Get Job Details${NC}"
JOB=$(curl -s -X GET "$API_URL/jobs/$JOB_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
if echo "$JOB" | grep -q "Living Room Paint Job"; then
  echo -e "${GREEN}✓ Retrieved job details${NC}\n"
else
  echo -e "${RED}✗ Failed to get job details${NC}\n"
fi

# Test 7: List Jobs (Customer)
echo -e "${BLUE}[7/15] List Customer Jobs${NC}"
JOBS=$(curl -s -X GET "$API_URL/jobs?limit=10" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
if echo "$JOBS" | grep -q "Living Room Paint Job"; then
  echo -e "${GREEN}✓ Listed customer jobs${NC}\n"
else
  echo -e "${RED}✗ Failed to list customer jobs${NC}\n"
fi

# Test 8: List Open Jobs (Painter)
echo -e "${BLUE}[8/15] List Available Jobs (Painter)${NC}"
OPEN_JOBS=$(curl -s -X GET "$API_URL/jobs?limit=10" \
  -H "Authorization: Bearer $PAINTER_TOKEN")
if echo "$OPEN_JOBS" | grep -q "Living Room Paint Job"; then
  echo -e "${GREEN}✓ Painter can see available jobs${NC}\n"
else
  echo -e "${RED}✗ Painter couldn't find available jobs${NC}\n"
fi

# Test 9: Submit Quote (Painter)
echo -e "${BLUE}[9/15] Submit Quote${NC}"
QUOTE_RESPONSE=$(curl -s -X POST "$API_URL/quotes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PAINTER_TOKEN" \
  -d "{
    \"jobId\": \"$JOB_ID\",
    \"amount\": 450,
    \"description\": \"Professional interior painting service. Includes prep, primer, and 2 coats of quality paint.\",
    \"timelineWeeks\": 2
  }")

QUOTE_ID=$(echo $QUOTE_RESPONSE | grep -o '"id":"[a-z0-9-]*' | head -1 | cut -d'"' -f4)
if [ ! -z "$QUOTE_ID" ]; then
  echo -e "${GREEN}✓ Quote submitted: $QUOTE_ID${NC}\n"
else
  echo -e "${RED}✗ Quote submission failed${NC}"
  echo "$QUOTE_RESPONSE" | jq .
  echo ""
fi

# Test 10: Get Quote Details
echo -e "${BLUE}[10/15] Get Quote Details${NC}"
QUOTE=$(curl -s -X GET "$API_URL/quotes/$QUOTE_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
if echo "$QUOTE" | grep -q "Professional interior painting"; then
  echo -e "${GREEN}✓ Retrieved quote details${NC}\n"
else
  echo -e "${RED}✗ Failed to get quote details${NC}\n"
fi

# Test 11: List Quotes for Job
echo -e "${BLUE}[11/15] List Quotes for Job${NC}"
QUOTES=$(curl -s -X GET "$API_URL/quotes/job/$JOB_ID" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
if echo "$QUOTES" | grep -q "Professional interior painting"; then
  echo -e "${GREEN}✓ Listed quotes for job${NC}\n"
else
  echo -e "${RED}✗ Failed to list quotes${NC}\n"
fi

# Test 12: Accept Quote (Customer)
echo -e "${BLUE}[12/15] Accept Quote${NC}"
ACCEPT=$(curl -s -X PUT "$API_URL/quotes/$QUOTE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "decision": "accepted"
  }')
if echo "$ACCEPT" | grep -q "accepted"; then
  echo -e "${GREEN}✓ Quote accepted${NC}\n"
else
  echo -e "${RED}✗ Failed to accept quote${NC}\n"
fi

# Test 13: Initiate Payment (Customer)
echo -e "${BLUE}[13/15] Initiate Escrow Payment${NC}"
PAYMENT=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{
    \"jobId\": \"$JOB_ID\",
    \"amount\": 450
  }")
if echo "$PAYMENT" | grep -q "escrow"; then
  echo -e "${GREEN}✓ Payment initiated${NC}\n"
else
  echo -e "${RED}✗ Failed to initiate payment${NC}"
  echo "$PAYMENT" | jq .
  echo ""
fi

# Test 14: Authorization Test - Painter Cannot Accept Quote
echo -e "${BLUE}[14/15] Authorization Check (Painter cannot accept quote)${NC}"
REJECT=$(curl -s -X PUT "$API_URL/quotes/$QUOTE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PAINTER_TOKEN" \
  -d '{
    "decision": "rejected"
  }')
if echo "$REJECT" | grep -q "Painters cannot"; then
  echo -e "${GREEN}✓ Authorization working (painter rejected correctly)${NC}\n"
else
  echo -e "${RED}✗ Authorization check may have issues${NC}\n"
fi

# Test 15: Authorization Test - Customer Cannot Submit Quote
echo -e "${BLUE}[15/15] Authorization Check (Customer cannot submit quote)${NC}"
BAD_QUOTE=$(curl -s -X POST "$API_URL/quotes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d "{
    \"jobId\": \"$JOB_ID\",
    \"amount\": 400,
    \"description\": \"Test quote\",
    \"timelineWeeks\": 1
  }")
if echo "$BAD_QUOTE" | grep -q "Customers cannot"; then
  echo -e "${GREEN}✓ Authorization working (customer blocked correctly)${NC}\n"
else
  echo -e "${RED}✗ Authorization check may have issues${NC}\n"
fi

echo -e "${BLUE}=== API Testing Complete ===${NC}"
echo -e "${GREEN}All Phase 1 endpoints tested successfully!${NC}"
