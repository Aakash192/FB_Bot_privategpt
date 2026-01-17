# Quick launcher for the chatbot UI
# This script starts the HTTP server and opens the chatbot in your browser

Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Starting Franchise Chatbot..." -ForegroundColor Green  
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "Error: Python not found!" -ForegroundColor Red
    Write-Host "   Please install Python to use this server." -ForegroundColor Yellow
    exit 1
}

# Check if chatbot HTML file exists
if (-not (Test-Path "chatbot-test-ui.html")) {
    Write-Host "Error: chatbot-test-ui.html not found!" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if Docker containers are running
Write-Host "Checking Docker containers..." -ForegroundColor Yellow
$dockerOutput = docker compose -f docker-compose.prod.yml ps 2>&1 | Out-String
if ($dockerOutput -match "Up") {
    Write-Host "Docker containers are running" -ForegroundColor Green
} else {
    Write-Host "Warning: Docker containers might not be running" -ForegroundColor Yellow
    Write-Host "   Starting Docker containers..." -ForegroundColor Yellow
    docker compose -f docker-compose.prod.yml up -d
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "Starting HTTP server on port 8000..." -ForegroundColor Cyan
Write-Host "The chatbot will open in your browser automatically" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

# Wait a moment for server to start, then open browser
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:8000/chatbot-test-ui.html"
} | Out-Null

# Use the Python script file directly (simpler and avoids escaping issues)
if (Test-Path "serve-chatbot.py") {
    Write-Host "Using serve-chatbot.py" -ForegroundColor Green
    & $pythonCmd serve-chatbot.py
} else {
    # Fallback: Use Python's built-in server with a simpler approach
    Write-Host "serve-chatbot.py not found, using simple HTTP server" -ForegroundColor Yellow
    $browserUrl = "http://localhost:8000/chatbot-test-ui.html"
    Write-Host "Open your browser to: $browserUrl" -ForegroundColor Cyan
    & $pythonCmd -m http.server 8000
}
