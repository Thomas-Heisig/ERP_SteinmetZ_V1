# Dashboard API Endpoints Test Script (PowerShell)
# Testet alle 12 API-Endpoints des System Diagnose Dashboards

$BASE_URL = "http://localhost:3000"
$ENDPOINTS = @(
    "/api/system/health",
    "/api/system/",
    "/api/system/system",
    "/api/system/database",
    "/api/system/status",
    "/api/system/resources",
    "/api/system/environment",
    "/api/system/dependencies",
    "/api/system/features",
    "/api/system/routes",
    "/api/system/functions",
    "/api/diagnostics/health"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🧪 Dashboard API Test Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$PASSED = 0
$FAILED = 0
$RESULTS = @()

foreach ($endpoint in $ENDPOINTS) {
    Write-Host -NoNewline "Testing: $endpoint ... "
    
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL$endpoint" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $statusCode = $response.StatusCode
        
        if ($statusCode -eq 200) {
            Write-Host "✅ HTTP 200" -ForegroundColor Green
            $PASSED++
            $RESULTS += [PSCustomObject]@{
                Endpoint = $endpoint
                Status = "✅ 200"
                Color = "Green"
            }
        } else {
            Write-Host "⚠️ HTTP $statusCode" -ForegroundColor Yellow
            $FAILED++
            $RESULTS += [PSCustomObject]@{
                Endpoint = $endpoint
                Status = "⚠️ $statusCode"
                Color = "Yellow"
            }
        }
    }
    catch {
        Write-Host "❌ Failed" -ForegroundColor Red
        $FAILED++
        $RESULTS += [PSCustomObject]@{
            Endpoint = $endpoint
            Status = "❌ Connection Error"
            Color = "Red"
        }
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "📊 Test Results" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $PASSED/12" -ForegroundColor Green
Write-Host "❌ Failed: $FAILED/12" -ForegroundColor Red
Write-Host ""

# Summary Table
Write-Host ""
Write-Host "Detailed Results:" -ForegroundColor Cyan
$RESULTS | Format-Table -AutoSize

if ($FAILED -eq 0) {
    Write-Host ""
    Write-Host "🎉 All endpoints working correctly!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some endpoints failed. Check backend logs." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Dashboard URL: http://localhost:3000/" -ForegroundColor Cyan
Write-Host "Login: admin / admin123" -ForegroundColor Cyan
