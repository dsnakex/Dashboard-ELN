# Nikaia Dashboard - Quick Deployment Script
# Run this script to deploy the application to GitHub

Write-Host "🧬 Nikaia Dashboard - Deployment Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host ""
    Write-Host "📝 Files to commit:" -ForegroundColor Yellow
    git status --short
    Write-Host ""

    # Ask for commit message
    $commitMessage = Read-Host "Enter commit message (or press Enter for default)"
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        $commitMessage = "Update Nikaia Dashboard - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }

    Write-Host ""
    Write-Host "📦 Adding files..." -ForegroundColor Yellow
    git add .

    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "$commitMessage"
    Write-Host "✅ Changes committed" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Blue
}

# Check if remote exists
$remotes = git remote
if (-not $remotes -contains "origin") {
    Write-Host ""
    Write-Host "🌐 GitHub Remote Setup" -ForegroundColor Yellow
    Write-Host "----------------------" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please create a GitHub repository first:"
    Write-Host "1. Go to https://github.com/new" -ForegroundColor Cyan
    Write-Host "2. Repository name: nikaia-dashboard" -ForegroundColor Cyan
    Write-Host "3. Choose Private or Public" -ForegroundColor Cyan
    Write-Host "4. Do NOT initialize with README" -ForegroundColor Cyan
    Write-Host ""

    $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/nikaia-dashboard.git)"

    if (-not [string]::IsNullOrWhiteSpace($repoUrl)) {
        git remote add origin $repoUrl
        Write-Host "✅ Remote added: $repoUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ No remote URL provided. Exiting." -ForegroundColor Red
        exit
    }
}

# Push to GitHub
Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow

try {
    # Check if main branch exists on remote
    git ls-remote --heads origin main 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        # Main branch exists, just push
        git push origin main
    } else {
        # First push, set upstream
        git branch -M main
        git push -u origin main
    }

    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit
}

# Display next steps
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Deployment to GitHub Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Clean Database (Supabase):" -ForegroundColor Yellow
Write-Host "   • Go to: https://app.supabase.com" -ForegroundColor White
Write-Host "   • Open SQL Editor" -ForegroundColor White
Write-Host "   • Run: scripts/reset_database.sql" -ForegroundColor White
Write-Host ""
Write-Host "2. Create Real Users:" -ForegroundColor Yellow
Write-Host "   • Edit: scripts/create_real_users.sql" -ForegroundColor White
Write-Host "   • Replace with your team emails" -ForegroundColor White
Write-Host "   • Run in Supabase SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy on Streamlit Cloud:" -ForegroundColor Yellow
Write-Host "   • Go to: https://share.streamlit.io" -ForegroundColor White
Write-Host "   • Click 'New app'" -ForegroundColor White
Write-Host "   • Select your GitHub repo" -ForegroundColor White
Write-Host "   • Main file: main.py" -ForegroundColor White
Write-Host "   • Add secrets (SUPABASE_URL, SUPABASE_KEY)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full guide: QUICK_DEPLOY.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
