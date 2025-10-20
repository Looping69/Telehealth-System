# Medplum FHIR Server Startup Script
# This script starts the Medplum FHIR server using Docker Compose

Write-Host "🚀 Starting Medplum FHIR Server..." -ForegroundColor Green

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if docker-compose.simple.yml exists
if (-not (Test-Path "docker-compose.simple.yml")) {
    Write-Host "❌ docker-compose.simple.yml not found in current directory" -ForegroundColor Red
    exit 1
}

# Start the services
Write-Host "📦 Starting Docker containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.simple.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Medplum services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Services are available at:" -ForegroundColor Cyan
    Write-Host "   • Medplum Service: https://api.medplum.com" -ForegroundColor White
    Write-Host "   • FHIR API: https://api.medplum.com/fhir/R4/" -ForegroundColor White
    Write-Host "   • PostgreSQL: localhost:5432" -ForegroundColor White
    Write-Host "   • Redis: localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Useful commands:" -ForegroundColor Cyan
    Write-Host "   • View logs: npm run medplum:logs" -ForegroundColor White
    Write-Host "   • Stop services: npm run medplum:stop" -ForegroundColor White
    Write-Host "   • Restart services: npm run medplum:restart" -ForegroundColor White
    Write-Host "   • Check status: npm run medplum:status" -ForegroundColor White
    Write-Host "   • Reset everything: npm run medplum:reset" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Waiting for Medplum server to be ready..." -ForegroundColor Yellow
    
    # Wait for Medplum server to be ready
    $maxAttempts = 45
    $attempt = 0
    do {
        $attempt++
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-WebRequest -Uri "https://api.medplum.com/fhir/R4/metadata" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Medplum service is accessible!" -ForegroundColor Green
                Write-Host ""
                Write-Host "🎉 Success! Medplum hosted FHIR service is accessible!" -ForegroundColor Green
                Write-Host "   You can now start your telehealth app with: npm run dev" -ForegroundColor Green
                Write-Host ""
                Write-Host "📋 Quick test:" -ForegroundColor Cyan
                Write-Host "   curl https://api.medplum.com/fhir/R4/metadata" -ForegroundColor White
                break
            }
        } catch {
            Write-Host "⏳ Attempt $attempt/$maxAttempts - Testing Medplum service..." -ForegroundColor Yellow
        }
    } while ($attempt -lt $maxAttempts)
    
    if ($attempt -eq $maxAttempts) {
        Write-Host "⚠️  Medplum server is taking longer than expected to start." -ForegroundColor Yellow
        Write-Host "   Check logs with: npm run medplum:logs" -ForegroundColor White
        Write-Host "   Check status with: npm run medplum:status" -ForegroundColor White
    }
} else {
    Write-Host "❌ Failed to start Medplum services. Check Docker logs for details." -ForegroundColor Red
    Write-Host "   Try: docker-compose -f docker-compose.simple.yml logs" -ForegroundColor White
    exit 1
}