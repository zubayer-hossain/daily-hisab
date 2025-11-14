# PowerShell script to reset development environment
# Usage: .\scripts\reset-dev.ps1

Write-Host "🛑 Stopping Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

Write-Host "🗑️  Deleting .next cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✅ Deleted .next folder" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .next folder not found" -ForegroundColor Gray
}

Write-Host "✅ Development environment reset complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready to start dev server. Run: npm run dev" -ForegroundColor Cyan

