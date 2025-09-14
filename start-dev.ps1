# MovieHub2 Development Environment Startup Script
Write-Host "🚀 Starting MovieHub2 Development Environment" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "📡 Starting Backend Server..." -ForegroundColor Blue
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Development Server
Write-Host "🎨 Starting Frontend Development Server..." -ForegroundColor Magenta
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npx react-scripts start"

Write-Host ""
Write-Host "🎉 Development environment is starting!" -ForegroundColor Green
Write-Host "📡 Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "🎨 Frontend App: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Both servers are running in separate windows." -ForegroundColor Cyan
Write-Host "Close the terminal windows to stop the servers." -ForegroundColor Cyan

Read-Host "Press Enter to exit this script"