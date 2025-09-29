# Supabase Database Backup Script (PowerShell)
# This script creates comprehensive backups of Supabase database including:
# - Database schema
# - Data (all tables)
# - Roles and permissions
# - Functions and triggers
# - RLS policies

param(
    [string]$BackupDir = "backups",
    [int]$RetentionDays = 7,
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host @"
Supabase Database Backup Script

Usage: .\backup-supabase.ps1 [-BackupDir <path>] [-RetentionDays <days>] [-Help]

Parameters:
  -BackupDir     Directory to store backups (default: backups)
  -RetentionDays Number of days to keep backups (default: 7)
  -Help          Show this help message

Environment Variables Required:
  SUPABASE_DB_URL         - Supabase database connection URL
  SUPABASE_ACCESS_TOKEN   - Supabase access token

Example:
  .\backup-supabase.ps1 -BackupDir "C:\backups" -RetentionDays 14
"@
    exit 0
}

# Configuration
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = "backup_$Timestamp.log"

# Logging functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $LogMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage -Encoding UTF8
}

function Write-Error-Log {
    param([string]$Message)
    Write-Log -Message $Message -Level "ERROR"
    exit 1
}

function Write-Warning-Log {
    param([string]$Message)
    Write-Log -Message $Message -Level "WARNING"
}

# Check if required environment variables are set
function Test-Environment {
    if (-not $env:SUPABASE_DB_URL) {
        Write-Error-Log "SUPABASE_DB_URL environment variable is required"
    }
    
    if (-not $env:SUPABASE_ACCESS_TOKEN) {
        Write-Error-Log "SUPABASE_ACCESS_TOKEN environment variable is required"
    }
    
    Write-Log "Environment variables validated"
}

# Create backup directory
function New-BackupDirectory {
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    Write-Log "Created backup directory: $BackupDir"
}

# Install Supabase CLI if not present
function Install-SupabaseCLI {
    try {
        $supabaseVersion = supabase --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Supabase CLI already installed: $supabaseVersion"
        } else {
            throw "Supabase CLI not found"
        }
    } catch {
        Write-Log "Installing Supabase CLI..."
        # For Windows, we'll use npm with --force flag or suggest manual installation
        try {
            npm install -g supabase@latest --force
            if ($LASTEXITCODE -ne 0) {
                throw "npm installation failed"
            }
        } catch {
            Write-Log "npm installation failed, trying alternative method..."
            # Alternative: Download and install manually
            $installScript = "https://supabase.com/install.sh"
            $tempScript = "$env:TEMP\supabase-install.sh"
            
            try {
                Invoke-WebRequest -Uri $installScript -OutFile $tempScript
                # Note: This requires WSL or Git Bash on Windows
                Write-Log "Please install Supabase CLI manually: https://supabase.com/docs/guides/cli/getting-started"
                Write-Log "Or use WSL/Git Bash to run: curl -fsSL https://supabase.com/install.sh | sh"
                throw "Manual installation required"
            } catch {
                Write-Log "Failed to install Supabase CLI automatically"
                Write-Log "Please install manually: https://supabase.com/docs/guides/cli/getting-started"
                throw "Supabase CLI installation failed"
            }
        }
    }
}

# Export database schema
function Export-Schema {
    $schemaFile = Join-Path $BackupDir "schema_$Timestamp.sql"
    Write-Log "Exporting database schema..."
    
    $output = supabase db dump --db-url $env:SUPABASE_DB_URL --schema-only --file $schemaFile 2>&1
    Write-Log "Schema export output: $output"
    
    if ((Test-Path $schemaFile) -and ((Get-Item $schemaFile).Length -gt 0)) {
        Write-Log "Schema exported successfully: $schemaFile"
    } else {
        Write-Error-Log "Failed to export schema"
    }
}

# Export database data
function Export-Data {
    $dataFile = Join-Path $BackupDir "data_$Timestamp.sql"
    Write-Log "Exporting database data..."
    
    $output = supabase db dump --db-url $env:SUPABASE_DB_URL --data-only --file $dataFile 2>&1
    Write-Log "Data export output: $output"
    
    if ((Test-Path $dataFile) -and ((Get-Item $dataFile).Length -gt 0)) {
        Write-Log "Data exported successfully: $dataFile"
    } else {
        Write-Error-Log "Failed to export data"
    }
}

# Export roles and permissions
function Export-Roles {
    $rolesFile = Join-Path $BackupDir "roles_$Timestamp.sql"
    Write-Log "Exporting roles and permissions..."
    
    $output = supabase db dump --db-url $env:SUPABASE_DB_URL --role-only --file $rolesFile 2>&1
    Write-Log "Roles export output: $output"
    
    if ((Test-Path $rolesFile) -and ((Get-Item $rolesFile).Length -gt 0)) {
        Write-Log "Roles exported successfully: $rolesFile"
    } else {
        Write-Error-Log "Failed to export roles"
    }
}

# Export functions and triggers
function Export-Functions {
    $functionsFile = Join-Path $BackupDir "functions_$Timestamp.sql"
    Write-Log "Exporting functions and triggers..."
    
    $output = supabase db dump --db-url $env:SUPABASE_DB_URL --function-only --file $functionsFile 2>&1
    Write-Log "Functions export output: $output"
    
    if ((Test-Path $functionsFile) -and ((Get-Item $functionsFile).Length -gt 0)) {
        Write-Log "Functions exported successfully: $functionsFile"
    } else {
        Write-Warning-Log "No functions found or failed to export functions"
    }
}

# Create complete backup archive
function New-BackupArchive {
    $archiveFile = Join-Path $BackupDir "supabase_backup_$Timestamp.zip"
    Write-Log "Creating backup archive..."
    
    $filesToArchive = Get-ChildItem -Path $BackupDir -Filter "*.sql" | ForEach-Object { $_.FullName }
    $filesToArchive += $LogFile
    
    Compress-Archive -Path $filesToArchive -DestinationPath $archiveFile -Force
    
    if ((Test-Path $archiveFile) -and ((Get-Item $archiveFile).Length -gt 0)) {
        Write-Log "Archive created successfully: $archiveFile"
        $env:BACKUP_FILE = "supabase_backup_$Timestamp.zip"
    } else {
        Write-Error-Log "Failed to create archive"
    }
}

# Clean up old backups
function Remove-OldBackups {
    Write-Log "Cleaning up backups older than $RetentionDays days..."
    
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    
    Get-ChildItem -Path $BackupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
    Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
    Get-ChildItem -Path $BackupDir -Filter "*.log" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
    
    Write-Log "Cleanup completed"
}

# Generate backup report
function New-BackupReport {
    $reportFile = Join-Path $BackupDir "backup_report_$Timestamp.txt"
    
    $reportContent = @"
Supabase Database Backup Report
===============================
Date: $(Get-Date)
Timestamp: $Timestamp
Backup Directory: $BackupDir

Files Created:
$(Get-ChildItem -Path $BackupDir -Filter "*.sql" | Format-Table Name, Length, LastWriteTime -AutoSize | Out-String)
$(Get-ChildItem -Path $BackupDir -Filter "*.zip" | Format-Table Name, Length, LastWriteTime -AutoSize | Out-String)

Backup Sizes:
$(Get-ChildItem -Path $BackupDir | Measure-Object -Property Length -Sum | Select-Object @{Name="Total Size (MB)"; Expression={[math]::Round($_.Sum / 1MB, 2)}} | Format-Table -AutoSize | Out-String)

Log Summary:
$(Get-Content $LogFile | Select-Object -Last 20 | Out-String)

"@
    
    Set-Content -Path $reportFile -Value $reportContent -Encoding UTF8
    Write-Log "Backup report generated: $reportFile"
}

# Main backup function
function Start-Backup {
    Write-Log "Starting Supabase database backup process..."
    
    Test-Environment
    New-BackupDirectory
    Install-SupabaseCLI
    
    Export-Schema
    Export-Data
    Export-Roles
    Export-Functions
    
    New-BackupArchive
    Remove-OldBackups
    New-BackupReport
    
    Write-Log "Backup process completed successfully!"
    Write-Log "Backup files location: $BackupDir"
    
    # Display summary
    Write-Host ""
    Write-Host "=== BACKUP SUMMARY ===" -ForegroundColor Green
    Write-Host "Backup Directory: $BackupDir"
    Write-Host "Archive File: supabase_backup_$Timestamp.zip"
    Write-Host "Log File: $LogFile"
    Write-Host "Total Size: $((Get-ChildItem -Path $BackupDir | Measure-Object -Property Length -Sum).Sum / 1MB | [math]::Round(2)) MB"
    Write-Host ""
}

# Run main function
try {
    Start-Backup
} catch {
    Write-Error-Log "Backup process failed: $($_.Exception.Message)"
}
