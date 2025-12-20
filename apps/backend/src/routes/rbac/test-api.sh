#!/bin/bash
# SPDX-License-Identifier: MIT
# apps/backend/src/routes/rbac/test-api.sh
# RBAC API Testing Script
# Usage: bash test-api.sh [token] [baseUrl]

set -e

# Configuration
TOKEN="${1:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...}"
BASE_URL="${2:-http://localhost:3000}"
API_URL="$BASE_URL/api/rbac"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
  echo -e "${YELLOW}Testing: $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

# Test: Get all roles
test_get_roles() {
  print_test "GET /api/rbac/roles"
  
  response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/roles")
  
  if echo "$response" | grep -q "success"; then
    print_success "Retrieved roles"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to retrieve roles"
    echo "$response"
  fi
}

# Test: Get role by ID
test_get_role_by_id() {
  print_test "GET /api/rbac/roles/:roleId"
  
  roleId="role_admin"
  response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/roles/$roleId")
  
  if echo "$response" | grep -q "success"; then
    print_success "Retrieved role $roleId"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to retrieve role $roleId"
  fi
}

# Test: Get current user roles
test_get_my_roles() {
  print_test "GET /api/rbac/me/roles"
  
  response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/me/roles")
  
  if echo "$response" | grep -q "success"; then
    print_success "Retrieved my roles"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to retrieve my roles"
  fi
}

# Test: Get current user permissions
test_get_my_permissions() {
  print_test "GET /api/rbac/me/permissions"
  
  response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/me/permissions")
  
  if echo "$response" | grep -q "success"; then
    print_success "Retrieved my permissions"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to retrieve my permissions"
  fi
}

# Test: Check permission
test_check_permission() {
  print_test "POST /api/rbac/check-permission"
  
  response=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"permission": "finance:create"}' \
    "$API_URL/check-permission")
  
  if echo "$response" | grep -q "success"; then
    print_success "Checked permission"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to check permission"
  fi
}

# Test: Check role
test_check_role() {
  print_test "POST /api/rbac/check-role"
  
  response=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"role": "admin"}' \
    "$API_URL/check-role")
  
  if echo "$response" | grep -q "success"; then
    print_success "Checked role"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to check role"
  fi
}

# Test: Get user roles
test_get_user_roles() {
  print_test "GET /api/rbac/users/:userId/roles"
  
  userId="user_123"  # Replace with actual user ID
  response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/users/$userId/roles")
  
  if echo "$response" | grep -q "success"; then
    print_success "Retrieved user roles"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to retrieve user roles"
  fi
}

# Test: Get user permissions
test_get_user_permissions() {
  print_test "GET /api/rbac/users/:userId/permissions"
  
  userId="user_123"  # Replace with actual user ID
  response=$(curl -s -H "Authorization: Bearer $TOKEN" \
    "$API_URL/users/$userId/permissions")
  
  if echo "$response" | grep -q "success"; then
    print_success "Retrieved user permissions"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to retrieve user permissions"
  fi
}

# Test: Assign role (admin only)
test_assign_role() {
  print_test "POST /api/rbac/users/:userId/roles/:roleId (admin only)"
  
  userId="user_123"
  roleId="role_manager"
  
  response=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"expiresAt": "2025-12-31T23:59:59Z"}' \
    "$API_URL/users/$userId/roles/$roleId")
  
  if echo "$response" | grep -q "success"; then
    print_success "Assigned role to user"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to assign role (check if you have admin permission)"
    echo "$response" | head -c 200
  fi
}

# Test: Revoke role (admin only)
test_revoke_role() {
  print_test "DELETE /api/rbac/users/:userId/roles/:roleId (admin only)"
  
  userId="user_123"
  roleId="role_manager"
  
  response=$(curl -s -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "$API_URL/users/$userId/roles/$roleId")
  
  if echo "$response" | grep -q "success"; then
    print_success "Revoked role from user"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
  else
    print_error "Failed to revoke role (check if you have admin permission)"
    echo "$response" | head -c 200
  fi
}

# Main menu
show_menu() {
  echo -e "\n${BLUE}RBAC API Test Menu${NC}"
  echo "1. Get all roles"
  echo "2. Get role by ID"
  echo "3. Get my roles"
  echo "4. Get my permissions"
  echo "5. Check permission"
  echo "6. Check role"
  echo "7. Get user roles"
  echo "8. Get user permissions"
  echo "9. Assign role (admin only)"
  echo "10. Revoke role (admin only)"
  echo "11. Run all tests"
  echo "0. Exit"
  echo ""
}

# Run all tests
run_all_tests() {
  print_header "Running All RBAC API Tests"
  
  test_get_roles
  test_get_role_by_id
  test_get_my_roles
  test_get_my_permissions
  test_check_permission
  test_check_role
  test_get_user_roles
  test_get_user_permissions
  
  print_header "Tests Complete"
}

# Main loop
if [ $# -lt 1 ]; then
  print_header "RBAC API Testing Script"
  echo "Usage: bash test-api.sh [token] [baseUrl]"
  echo ""
  echo "Parameters:"
  echo "  token   - JWT token (default: example token)"
  echo "  baseUrl - API base URL (default: http://localhost:3000)"
  echo ""
  echo "Example:"
  echo "  bash test-api.sh 'eyJhbGciOiJIUzI1NiIs...' 'http://localhost:3000'"
  echo ""
  
  run_all_tests
else
  while true; do
    show_menu
    read -p "Enter choice: " choice
    
    case $choice in
      1) test_get_roles ;;
      2) test_get_role_by_id ;;
      3) test_get_my_roles ;;
      4) test_get_my_permissions ;;
      5) test_check_permission ;;
      6) test_check_role ;;
      7) test_get_user_roles ;;
      8) test_get_user_permissions ;;
      9) test_assign_role ;;
      10) test_revoke_role ;;
      11) run_all_tests ;;
      0) echo "Exiting..."; exit 0 ;;
      *) echo "Invalid choice" ;;
    esac
  done
fi
