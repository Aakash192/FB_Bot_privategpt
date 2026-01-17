# Test if PrivateGPT is using Knowledge Base
Write-Host "Testing if PrivateGPT uses Knowledge Base..." -ForegroundColor Cyan
Write-Host ""

$body = @{
    messages = @(
        @{
            role = "user"
            content = "What is Anago?"
        }
    )
    use_context = $true
    stream = $false
    include_sources = $true
} | ConvertTo-Json -Depth 10 -Compress

$jsonBody = $body -replace '\\', '\\' -replace '"', '\"'

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/v1/chat/completions" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ Response received!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Bot Response:" -ForegroundColor Yellow
    Write-Host $response.choices[0].message.content -ForegroundColor White
    Write-Host ""
    
    if ($response.choices[0].sources -and $response.choices[0].sources.Count -gt 0) {
        Write-Host "✅ KNOWLEDGE BASE IS BEING USED!" -ForegroundColor Green
        Write-Host "Sources from your documents:" -ForegroundColor Cyan
        $response.choices[0].sources | ForEach-Object {
            $fileName = $_.document.doc_metadata.file_name
            $page = if ($_.metadata.page_label) { " (page $($_.metadata.page_label))" } else { "" }
            Write-Host "  - $fileName$page" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️  WARNING: No sources returned!" -ForegroundColor Yellow
        Write-Host "This response may be from general knowledge, not your documents." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode
}

