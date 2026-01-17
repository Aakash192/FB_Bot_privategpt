# Docker Desktop Health Check Script
Write-Host "=== Docker Desktop Health Check ===" -ForegroundColor Cyan
Write-Host ""

$checks = @{
    "Docker Process" = { Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue | Select-Object -First 1 }
    "Docker Version" = { docker version 2>&1 | Select-String -Pattern "Version" | Select-Object -First 1 }
    "Docker Info" = { docker info 2>&1 | Select-String -Pattern "Server Version|Containers" | Select-Object -First 1 }
    "Docker Images" = { docker images 2>&1 | Select-Object -First 3 }
}

$allPassed = $true

foreach ($check in $checks.GetEnumerator()) {
    Write-Host "Checking: $($check.Key)..." -NoNewline
    try {
        $result = & $check.Value
        if ($result -and $LASTEXITCODE -eq 0) {
            Write-Host " ✓ PASSED" -ForegroundColor Green
        } else {
            Write-Host " ✗ FAILED" -ForegroundColor Red
            $allPassed = $false
        }
    } catch {
        Write-Host " ✗ ERROR: $_" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
if ($allPassed) {
    Write-Host "✓ Docker Desktop is ready!" -ForegroundColor Green
    Write-Host "You can now run: docker compose -f docker-compose.prod.yml up -d --build" -ForegroundColor Cyan
} else {
    Write-Host "✗ Docker Desktop is not ready. Please restart it and try again." -ForegroundColor Red
}

