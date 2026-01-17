# PrivateGPT Startup Script
# Make sure to set your OPENAI_API_KEY environment variable first

Write-Host "Starting PrivateGPT with OpenAI..." -ForegroundColor Green
Write-Host ""

# Check if venv exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the private-gpt directory and the venv is created." -ForegroundColor Yellow
    exit 1
}

# Check if OPENAI_API_KEY is set
if (-not $env:OPENAI_API_KEY) {
    Write-Host "WARNING: OPENAI_API_KEY environment variable is not set!" -ForegroundColor Yellow
    Write-Host "The application may fail to start without an API key." -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to set it now? (y/n)"
    if ($response -eq "y") {
        $apiKey = Read-Host "Enter your OpenAI API Key" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKey)
        $env:OPENAI_API_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        Write-Host "API Key set for this session." -ForegroundColor Green
    }
}

# Activate venv and run
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\python.exe -m private_gpt

