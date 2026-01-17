# Restart PrivateGPT Docker Services
Write-Host "Restarting PrivateGPT services..." -ForegroundColor Cyan

docker compose -f docker-compose.prod.yml restart

Write-Host "`nWaiting for services to restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

docker compose -f docker-compose.prod.yml ps

Write-Host "`nTo view logs, run:" -ForegroundColor Cyan
Write-Host "  docker compose -f docker-compose.prod.yml logs -f" -ForegroundColor White


