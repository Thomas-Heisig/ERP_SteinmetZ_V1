#!/bin/bash
# Dashboard API Endpoints Test Script
# Testet alle 12 API-Endpoints des System Diagnose Dashboards

BASE_URL="http://localhost:3000"
ENDPOINTS=(
    "/api/system/health"
    "/api/system/"
    "/api/system/system"
    "/api/system/database"
    "/api/system/status"
    "/api/system/resources"
    "/api/system/environment"
    "/api/system/dependencies"
    "/api/system/features"
    "/api/system/routes"
    "/api/system/functions"
    "/api/diagnostics/health"
)

echo "========================================="
echo "🧪 Dashboard API Test Script"
echo "========================================="
echo ""

PASSED=0
FAILED=0

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "Testing: $endpoint ... "
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ HTTP 200"
        ((PASSED++))
    else
        echo "❌ HTTP $HTTP_CODE"
        ((FAILED++))
    fi
done

echo ""
echo "========================================="
echo "📊 Test Results"
echo "========================================="
echo "✅ Passed: $PASSED/12"
echo "❌ Failed: $FAILED/12"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All endpoints working correctly!"
else
    echo "⚠️  Some endpoints failed. Check backend logs."
fi
