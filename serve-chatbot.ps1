# PowerShell script to serve the chatbot HTML file using Python HTTP server

$Port = 8000
$HtmlFile = "chatbot-test-ui.html"

# Check if HTML file exists
if (-not (Test-Path $HtmlFile)) {
    Write-Host "❌ Error: $HtmlFile not found in current directory!" -ForegroundColor Red
    Write-Host "   Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if Python is available
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} else {
    Write-Host "❌ Error: Python not found!" -ForegroundColor Red
    Write-Host "   Please install Python to use this server." -ForegroundColor Yellow
    exit 1
}

# Use Python's built-in HTTP server
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🚀 Chatbot Test Server Starting..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📁 Serving files from: $(Get-Location)" -ForegroundColor White
Write-Host "🌐 Chatbot UI: http://localhost:$Port/$HtmlFile" -ForegroundColor Cyan
Write-Host "🔗 PrivateGPT API: http://localhost:8001/v1/chat/completions" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Server is running on port $Port" -ForegroundColor Green
Write-Host "📖 Open your browser to: http://localhost:$Port/$HtmlFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Open browser automatically
Start-Process "http://localhost:$Port/$HtmlFile"

# Start Python HTTP server with CORS support
$script = @"
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = $Port

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

try:
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f'Server started on port {PORT}')
        httpd.serve_forever()
except KeyboardInterrupt:
    print('\nServer stopped')
"@

# Run Python script
& $pythonCmd -c $script

