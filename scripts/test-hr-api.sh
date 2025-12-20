#!/bin/bash
# HR Module API Test Script

BASE_URL="http://localhost:3000/api/hr"
TOKEN="${API_TOKEN}"  # Set your JWT token here

echo "====================================="
echo "HR Module API Test Script"
echo "====================================="
echo ""

# Helper function to make API requests
api_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  
  echo "➤ $method $endpoint"
  
  if [ -z "$data" ]; then
    curl -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      "$BASE_URL$endpoint" \
      -w "\nStatus: %{http_code}\n" \
      -s | jq '.'
  else
    curl -X "$method" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint" \
      -w "\nStatus: %{http_code}\n" \
      -s | jq '.'
  fi
  
  echo ""
}

# Test 1: Get HR Statistics
echo "1. Get HR Statistics"
echo "-------------------------------------"
api_request "GET" "/statistics"

# Test 2: Create Department
echo "2. Create Department"
echo "-------------------------------------"
DEPT_DATA='{
  "name": "Engineering",
  "description": "Software Development Department",
  "budget": 500000,
  "is_active": true
}'
api_request "POST" "/departments" "$DEPT_DATA"

# Test 3: List Departments
echo "3. List Departments"
echo "-------------------------------------"
api_request "GET" "/departments"

# Test 4: Create Employee
echo "4. Create Employee"
echo "-------------------------------------"
EMPLOYEE_DATA='{
  "first_name": "Max",
  "last_name": "Mustermann",
  "email": "max.mustermann@example.com",
  "phone": "+49 123 456789",
  "department": "Engineering",
  "position": "Software Developer",
  "start_date": "2024-01-15",
  "status": "active",
  "country": "Germany",
  "city": "Munich",
  "postal_code": "80331",
  "emergency_contact": "Maria Mustermann",
  "emergency_phone": "+49 987 654321"
}'
EMPLOYEE_RESPONSE=$(curl -X "POST" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$EMPLOYEE_DATA" \
  "$BASE_URL/employees" \
  -s)

echo "$EMPLOYEE_RESPONSE" | jq '.'
EMPLOYEE_ID=$(echo "$EMPLOYEE_RESPONSE" | jq -r '.data.id')
echo "Created Employee ID: $EMPLOYEE_ID"
echo ""

# Test 5: Get Employee with Relations
echo "5. Get Employee with Relations"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  api_request "GET" "/employees/$EMPLOYEE_ID"
fi

# Test 6: List Employees
echo "6. List Employees (with pagination)"
echo "-------------------------------------"
api_request "GET" "/employees?page=1&limit=10&sort_by=last_name&sort_order=asc"

# Test 7: Search Employees
echo "7. Search Employees"
echo "-------------------------------------"
api_request "GET" "/employees?search=Mustermann&status=active"

# Test 8: Create Contract
echo "8. Create Contract"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  CONTRACT_DATA="{
    \"employee_id\": \"$EMPLOYEE_ID\",
    \"type\": \"permanent\",
    \"start_date\": \"2024-01-15\",
    \"salary\": 65000,
    \"working_hours\": 40,
    \"vacation_days\": 30,
    \"probation_period\": 6,
    \"notice_period\": 3,
    \"status\": \"active\"
  }"
  api_request "POST" "/contracts" "$CONTRACT_DATA"
fi

# Test 9: Get Employee Contracts
echo "9. Get Employee Contracts"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  api_request "GET" "/employees/$EMPLOYEE_ID/contracts"
fi

# Test 10: Create Time Entry
echo "10. Create Time Entry"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  TIME_ENTRY_DATA="{
    \"employee_id\": \"$EMPLOYEE_ID\",
    \"date\": \"2024-12-19\",
    \"start_time\": \"09:00\",
    \"end_time\": \"17:30\",
    \"break_minutes\": 30,
    \"type\": \"regular\",
    \"notes\": \"Regular working day\"
  }"
  TIME_ENTRY_RESPONSE=$(curl -X "POST" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$TIME_ENTRY_DATA" \
    "$BASE_URL/time-entries" \
    -s)
  
  echo "$TIME_ENTRY_RESPONSE" | jq '.'
  TIME_ENTRY_ID=$(echo "$TIME_ENTRY_RESPONSE" | jq -r '.data.id')
  echo "Created Time Entry ID: $TIME_ENTRY_ID"
  echo ""
fi

# Test 11: Get Time Entries
echo "11. Get Time Entries"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  api_request "GET" "/time-entries?employee_id=$EMPLOYEE_ID&start_date=2024-12-01&end_date=2024-12-31"
fi

# Test 12: Create Leave Request
echo "12. Create Leave Request"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  LEAVE_REQUEST_DATA="{
    \"employee_id\": \"$EMPLOYEE_ID\",
    \"type\": \"vacation\",
    \"start_date\": \"2024-12-23\",
    \"end_date\": \"2024-12-27\",
    \"days\": 5,
    \"reason\": \"Christmas vacation\",
    \"notes\": \"Year-end vacation\"
  }"
  LEAVE_REQUEST_RESPONSE=$(curl -X "POST" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$LEAVE_REQUEST_DATA" \
    "$BASE_URL/leave-requests" \
    -s)
  
  echo "$LEAVE_REQUEST_RESPONSE" | jq '.'
  LEAVE_REQUEST_ID=$(echo "$LEAVE_REQUEST_RESPONSE" | jq -r '.data.id')
  echo "Created Leave Request ID: $LEAVE_REQUEST_ID"
  echo ""
fi

# Test 13: Get Leave Requests
echo "13. Get Leave Requests"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  api_request "GET" "/leave-requests?employee_id=$EMPLOYEE_ID"
fi

# Test 14: Create Onboarding Process
echo "14. Create Onboarding Process"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  ONBOARDING_DATA="{
    \"employee_id\": \"$EMPLOYEE_ID\",
    \"start_date\": \"2024-01-15\",
    \"notes\": \"Standard onboarding for software developer\"
  }"
  ONBOARDING_RESPONSE=$(curl -X "POST" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ONBOARDING_DATA" \
    "$BASE_URL/onboarding" \
    -s)
  
  echo "$ONBOARDING_RESPONSE" | jq '.'
  ONBOARDING_ID=$(echo "$ONBOARDING_RESPONSE" | jq -r '.data.id')
  echo "Created Onboarding ID: $ONBOARDING_ID"
  echo ""
fi

# Test 15: Create Onboarding Tasks
echo "15. Create Onboarding Tasks"
echo "-------------------------------------"
if [ "$ONBOARDING_ID" != "null" ]; then
  TASK1_DATA="{
    \"onboarding_id\": \"$ONBOARDING_ID\",
    \"title\": \"Setup development environment\",
    \"description\": \"Install IDE, Git, and configure access\",
    \"due_date\": \"2024-01-16\",
    \"sort_order\": 1
  }"
  api_request "POST" "/onboarding/tasks" "$TASK1_DATA"
  
  TASK2_DATA="{
    \"onboarding_id\": \"$ONBOARDING_ID\",
    \"title\": \"Complete security training\",
    \"description\": \"Watch security training videos and complete quiz\",
    \"due_date\": \"2024-01-17\",
    \"sort_order\": 2
  }"
  api_request "POST" "/onboarding/tasks" "$TASK2_DATA"
fi

# Test 16: Get Onboarding with Tasks
echo "16. Get Onboarding with Tasks"
echo "-------------------------------------"
if [ "$ONBOARDING_ID" != "null" ]; then
  api_request "GET" "/onboarding/$ONBOARDING_ID"
fi

# Test 17: Create Overtime Record
echo "17. Create Overtime Record"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  OVERTIME_DATA="{
    \"employee_id\": \"$EMPLOYEE_ID\",
    \"date\": \"2024-12-18\",
    \"hours\": 3,
    \"reason\": \"Critical bug fix\",
    \"notes\": \"Production issue required immediate attention\"
  }"
  api_request "POST" "/overtime" "$OVERTIME_DATA"
fi

# Test 18: Get Overtime Records
echo "18. Get Overtime Records"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  api_request "GET" "/overtime?employee_id=$EMPLOYEE_ID"
fi

# Test 19: Update Employee
echo "19. Update Employee"
echo "-------------------------------------"
if [ "$EMPLOYEE_ID" != "null" ]; then
  UPDATE_DATA='{
    "position": "Senior Software Developer",
    "notes": "Promoted after 6 months probation"
  }'
  api_request "PUT" "/employees/$EMPLOYEE_ID" "$UPDATE_DATA"
fi

# Test 20: Get Updated Statistics
echo "20. Get Updated Statistics"
echo "-------------------------------------"
api_request "GET" "/statistics"

echo "====================================="
echo "HR Module API Tests Completed"
echo "====================================="
