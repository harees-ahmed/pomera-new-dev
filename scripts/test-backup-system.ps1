# Test script for Supabase backup system (PowerShell)
# This script validates the backup configuration and tests connectivity

param(
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host @"
Supabase Backup System Test Suite (PowerShell)

Usage: .\test-backup-system.ps1 [-Help]

This script validates the backup configuration and tests connectivity.

Environment Variables Required:
  SUPABASE_DB_URL         - Supabase database connection URL
  SUPABASE_ACCESS_TOKEN   - Supabase access token

Example:
  .\test-backup-system.ps1
"@
    exit 0
}

# Test results
$script:TESTS_PASSED = 0
$script:TESTS_FAILED = 0

# Logging functions
function Write-TestLog {
    param([string]$Message)
    Write-Host "[TEST] $Message" -ForegroundColor Blue
}

function Write-TestSuccess {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
    $script:TESTS_PASSED++
}

function Write-TestFail {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    $script:TESTS_FAILED++
}

function Write-TestWarning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

# Test 1: Check if required environment variables are set
function Test-Environment {
    Write-TestLog "Testing environment variables..."
    
    if (-not $env:SUPABASE_DB_URL) {
        Write-TestFail "SUPABASE_DB_URL environment variable is not set"
        return $false
    } else {
        Write-TestSuccess "SUPABASE_DB_URL is set"
    }
    
    if (-not $env:SUPABASE_ACCESS_TOKEN) {
        Write-TestFail "SUPABASE_ACCESS_TOKEN environment variable is not set"
        return $false
    } else {
        Write-TestSuccess "SUPABASE_ACCESS_TOKEN is set"
    }
    
    return $true
}

# Test 2: Check if Supabase CLI is available
function Test-SupabaseCLI {
    Write-TestLog "Testing Supabase CLI availability..."
    
    try {
        $version = supabase --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-TestSuccess "Supabase CLI is installed: $version"
            return $true
        } else {
            throw "Supabase CLI not found"
        }
    } catch {
        Write-TestFail "Supabase CLI is not installed"
        return $false
    }
}

# Test 3: Test database connectivity
function Test-DatabaseConnectivity {
    Write-TestLog "Testing database connectivity..."
    
    try {
        $result = supabase db ping --db-url $env:SUPABASE_DB_URL 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-TestSuccess "Database connection successful"
            return $true
        } else {
            Write-TestFail "Database connection failed: $result"
            return $false
        }
    } catch {
        Write-TestFail "Database connection test failed: $($_.Exception.Message)"
        return $false
    }
}

# Test 4: Test backup script exists and is executable
function Test-BackupScript {
    Write-TestLog "Testing backup script availability..."
    
    $scriptPath = "scripts\backup-supabase.ps1"
    
    if (Test-Path $scriptPath) {
        Write-TestSuccess "PowerShell backup script exists"
        return $true
    } else {
        Write-TestFail "PowerShell backup script does not exist"
        return $false
    }
}

# Test 5: Test GitHub Actions workflow file
function Test-GitHubWorkflow {
    Write-TestLog "Testing GitHub Actions workflow..."
    
    $workflowPath = ".github\workflows\supabase-backup.yml"
    
    if (Test-Path $workflowPath) {
        Write-TestSuccess "GitHub Actions workflow file exists"
        
        # Basic file content check
        $content = Get-Content $workflowPath -Raw
        if ($content -match "name: Daily Supabase Database Backup") {
            Write-TestSuccess "GitHub Actions workflow content looks valid"
        } else {
            Write-TestWarning "GitHub Actions workflow content validation failed"
        }
        
        return $true
    } else {
        Write-TestFail "GitHub Actions workflow file does not exist"
        return $false
    }
}

# Test 6: Test backup directory creation
function Test-BackupDirectory {
    Write-TestLog "Testing backup directory creation..."
    
    $testDir = "test_backups"
    
    try {
        if (New-Item -ItemType Directory -Path $testDir -Force -ErrorAction Stop) {
            Write-TestSuccess "Backup directory creation successful"
            Remove-Item $testDir -Force -ErrorAction SilentlyContinue
            return $true
        } else {
            Write-TestFail "Failed to create backup directory"
            return $false
        }
    } catch {
        Write-TestFail "Failed to create backup directory: $($_.Exception.Message)"
        return $false
    }
}

# Test 7: Test backup script help/usage
function Test-BackupScriptHelp {
    Write-TestLog "Testing backup script help functionality..."
    
    try {
        $result = & "scripts\backup-supabase.ps1" -Help 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-TestSuccess "Backup script help functionality works"
            return $true
        } else {
            Write-TestWarning "Backup script help functionality not available or failed"
            return $true  # Not critical
        }
    } catch {
        Write-TestWarning "Backup script help functionality test failed: $($_.Exception.Message)"
        return $true  # Not critical
    }
}

# Test 8: Test bash script (if on WSL or Git Bash)
function Test-BashScript {
    Write-TestLog "Testing bash backup script..."
    
    $bashScriptPath = "scripts\backup-supabase.sh"
    
    if (Test-Path $bashScriptPath) {
        Write-TestSuccess "Bash backup script exists"
        
        # Test if bash is available
        if (Get-Command bash -ErrorAction SilentlyContinue) {
            Write-TestSuccess "Bash is available"
        } else {
            Write-TestWarning "Bash not available (this is normal on Windows without WSL)"
        }
        
        return $true
    } else {
        Write-TestFail "Bash backup script does not exist"
        return $false
    }
}

# Test 9: Test documentation files
function Test-Documentation {
    Write-TestLog "Testing documentation files..."
    
    $docPath = "BACKUP_SETUP.md"
    
    if (Test-Path $docPath) {
        Write-TestSuccess "Backup setup documentation exists"
        return $true
    } else {
        Write-TestFail "Backup setup documentation missing"
        return $false
    }
}

# Test 10: Dry run test (if environment is set)
function Test-DryRun {
    Write-TestLog "Testing backup script dry run..."
    
    if ($env:SUPABASE_DB_URL -and $env:SUPABASE_ACCESS_TOKEN) {
        Write-TestWarning "Skipping dry run test to avoid creating actual backups"
        Write-TestWarning "To test actual backup, run: .\scripts\backup-supabase.ps1"
    } else {
        Write-TestWarning "Environment variables not set, skipping dry run test"
    }
    
    return $true
}

# Main test function
function Start-TestSuite {
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Supabase Backup System Test Suite" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Run all tests
    Test-Environment | Out-Null
    Test-SupabaseCLI | Out-Null
    Test-DatabaseConnectivity | Out-Null
    Test-BackupScript | Out-Null
    Test-GitHubWorkflow | Out-Null
    Test-BackupDirectory | Out-Null
    Test-BackupScriptHelp | Out-Null
    Test-BashScript | Out-Null
    Test-Documentation | Out-Null
    Test-DryRun | Out-Null
    
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Test Results Summary" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "Tests Passed: $script:TESTS_PASSED" -ForegroundColor Green
    Write-Host "Tests Failed: $script:TESTS_FAILED" -ForegroundColor Red
    Write-Host ""
    
    if ($script:TESTS_FAILED -eq 0) {
        Write-Host "All tests passed! Backup system is ready to use." -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Set up GitHub Secrets (see BACKUP_SETUP.md)" -ForegroundColor White
        Write-Host "2. Test manual backup: .\scripts\backup-supabase.ps1" -ForegroundColor White
        Write-Host "3. Trigger GitHub Actions workflow manually" -ForegroundColor White
        exit 0
    } else {
        Write-Host "Some tests failed. Please fix the issues before using the backup system." -ForegroundColor Red
        Write-Host ""
        Write-Host "Common fixes:" -ForegroundColor Yellow
        Write-Host "1. Install Supabase CLI: npm install -g supabase@latest" -ForegroundColor White
        Write-Host "2. Set environment variables: `$env:SUPABASE_DB_URL=... ; `$env:SUPABASE_ACCESS_TOKEN=..." -ForegroundColor White
        Write-Host "3. Ensure all script files exist in the scripts directory" -ForegroundColor White
        exit 1
    }
}

# Run main function
try {
    Start-TestSuite
} catch {
    Write-TestFail "Test suite failed: $($_.Exception.Message)"
    exit 1
}
