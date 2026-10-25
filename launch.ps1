$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

function Step($msg)  { Write-Host "  >>  $msg" -ForegroundColor Cyan }
function OK($msg)    { Write-Host "  OK  $msg" -ForegroundColor Green }
function Fatal($msg) { Write-Host "  XX  $msg" -ForegroundColor Red; Read-Host "Press Enter to exit"; exit 1 }

Write-Host ""
Write-Host "  ============================================" -ForegroundColor DarkCyan
Write-Host "   AMSV  --  Launcher" -ForegroundColor Cyan
Write-Host "  ============================================" -ForegroundColor DarkCyan
Write-Host ""

# ── Frontend ─────────────────────────────────────────────────────────────
Step "Starting frontend dev server..."
$devServer = Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$Root\app'; bun run dev"
) -PassThru

Step "Waiting for app to be ready..."
$deadline = (Get-Date).AddSeconds(30)
while ((Get-Date) -lt $deadline) {
    try {
        Invoke-WebRequest "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 | Out-Null
        break
    } catch { Start-Sleep 1 }
}

# ── Open browser ─────────────────────────────────────────────────────────
Step "Opening browser..."
Start-Process "http://localhost:5173"
OK "App running at http://localhost:5173"

Write-Host ""
Write-Host "  Press Enter to STOP and exit." -ForegroundColor Gray
Read-Host | Out-Null

Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue
Write-Host "  OK  Stopped." -ForegroundColor Green
