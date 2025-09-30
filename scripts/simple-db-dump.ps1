# Simple Supabase Database Dump Script (PowerShell)
# Uses hardcoded connection string for direct PostgreSQL access

param(
    [string]$BackupDir = "backups",
    [int]$RetentionDays = 7,
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host @"
Simple Supabase Database Dump Script

Usage: .\simple-db-dump.ps1 [-BackupDir <path>] [-RetentionDays <days>] [-Help]

Parameters:
  -BackupDir     Directory to store backups (default: backups)
  -RetentionDays Number of days to keep backups (default: 7)
  -Help          Show this help message

This script uses a hardcoded database connection string and creates:
- Complete database dump
- Schema-only dump
- Data-only dump
- Compressed archive

Example:
  .\simple-db-dump.ps1 -BackupDir "C:\backups" -RetentionDays 14
"@
    exit 0
}

# Hardcoded database connection
$DB_URL = "postgresql://postgres:R2xjCa9f4`$iRB9b@db.mygfpmrnixbejrpujwlu.supabase.co:5432/postgres"

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

# Create backup directory
function New-BackupDirectory {
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    Write-Log "Created backup directory: $BackupDir"
}

# Check if pg_dump is available
function Test-PgDump {
    try {
        $pgDumpVersion = pg_dump --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "PostgreSQL client tools already installed: $pgDumpVersion"
        } else {
            throw "pg_dump not found"
        }
    } catch {
        Write-Log "PostgreSQL client tools not found"
        Write-Log "Please install PostgreSQL client tools:"
        Write-Log "1. Download from: https://www.postgresql.org/download/windows/"
        Write-Log "2. Or use Chocolatey: choco install postgresql"
        Write-Log "3. Or use Scoop: scoop install postgresql"
        Write-Error-Log "PostgreSQL client tools required"
    }
}

# Export complete database dump
function Export-CompleteDump {
    $dumpFile = Join-Path $BackupDir "complete_dump_$Timestamp.sql"
    Write-Log "Exporting complete database dump..."
    
    $output = pg_dump $DB_URL > $dumpFile 2>&1
    Write-Log "Complete dump export output: $output"
    
    if ((Test-Path $dumpFile) -and ((Get-Item $dumpFile).Length -gt 0)) {
        Write-Log "Complete dump exported successfully: $dumpFile"
        $env:BACKUP_FILE = "complete_dump_$Timestamp.sql"
    } else {
        Write-Error-Log "Failed to export complete dump"
    }
}

# Export schema only
function Export-Schema {
    $schemaFile = Join-Path $BackupDir "schema_$Timestamp.sql"
    Write-Log "Exporting database schema..."
    
    $output = pg_dump --schema-only $DB_URL > $schemaFile 2>&1
    Write-Log "Schema export output: $output"
    
    if ((Test-Path $schemaFile) -and ((Get-Item $schemaFile).Length -gt 0)) {
        Write-Log "Schema exported successfully: $schemaFile"
    } else {
        Write-Error-Log "Failed to export schema"
    }
}

# Export data only
function Export-Data {
    $dataFile = Join-Path $BackupDir "data_$Timestamp.sql"
    Write-Log "Exporting database data..."
    
    $output = pg_dump --data-only $DB_URL > $dataFile 2>&1
    Write-Log "Data export output: $output"
    
    if ((Test-Path $dataFile) -and ((Get-Item $dataFile).Length -gt 0)) {
        Write-Log "Data exported successfully: $dataFile"
    } else {
        Write-Error-Log "Failed to export data"
    }
}

# Create compressed archive
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
Simple Supabase Database Backup Report
=====================================
Date: $(Get-Date)
Timestamp: $Timestamp
Backup Directory: $BackupDir
Database URL: postgresql://postgres:***@db.mygfpmrnixbejrpujwlu.supabase.co:5432/postgres

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
    Write-Log "Starting simple Supabase database backup process..."
    Write-Log "Using hardcoded database connection"
    
    New-BackupDirectory
    Test-PgDump
    
    Export-CompleteDump
    Export-Schema
    Export-Data
    
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
    $totalSize = [math]::Round((Get-ChildItem -Path $BackupDir | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    Write-Host "Total Size: $totalSize MB"
    Write-Host ""
}

# Run main function
try {
    Start-Backup
} catch {
    Write-Error-Log "Backup process failed: $($_.Exception.Message)"
}
