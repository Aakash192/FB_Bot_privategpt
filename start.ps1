# Start PrivateGPT Docker Services
Write-Host "Starting PrivateGPT services..." -ForegroundColor Cyan

docker compose -f docker-compose.prod.yml up -d

Write-Host "`nWaiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

docker compose -f docker-compose.prod.yml ps

Write-Host "`nChecking application health..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "Application is running!" -ForegroundColor Green
    Write-Host "  API: http://localhost:8001" -ForegroundColor White
    Write-Host "  Docs: http://localhost:8001/api/docs" -ForegroundColor White
} catch {
    Write-Host "  Application may still be starting. Check logs with:" -ForegroundColor Yellow
    Write-Host "  docker compose -f docker-compose.prod.yml logs -f private-gpt" -ForegroundColor White
}
