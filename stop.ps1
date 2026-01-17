# Stop PrivateGPT Docker Services
Write-Host "Stopping PrivateGPT services..." -ForegroundColor Yellow

docker compose -f docker-compose.prod.yml down

Write-Host "`nServices stopped!" -ForegroundColor Green
Write-Host "To start again, run: .\start.ps1" -ForegroundColor Cyan


