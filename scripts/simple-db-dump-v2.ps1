# Simple Supabase Database Dump Script (PowerShell)
# Uses hardcoded connection string for direct PostgreSQL access

param(
    [string]$BackupDir = "backups",
    [switch]$Help
)

# Show help if requested
if ($Help) {
    Write-Host @"
Simple Supabase Database Dump Script

Usage: .\simple-db-dump.ps1 [-BackupDir <path>] [-Help]

Parameters:
  -BackupDir     Directory to store backups (default: backups)
  -Help          Show this help message

This script uses a hardcoded database connection string and creates:
- Complete database dump
- Schema-only dump
- Data-only dump
- Compressed archive

Example:
  .\simple-db-dump.ps1 -BackupDir "C:\backups"
"@
    exit 0
}

# Hardcoded database connection
$DB_URL = "postgresql://postgres:R2xjCa9f4`$iRB9b@db.mygfpmrnixbejrpujwlu.supabase.co:5432/postgres"

# Configuration
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Logging function
function Write-Log {
    param([string]$Message)
    $LogMessage = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Write-Host $LogMessage
}

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Log "Created backup directory: $BackupDir"
}

# Check if pg_dump is available
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
    Write-Log "ERROR: PostgreSQL client tools required"
    exit 1
}

# Export complete database dump
$dumpFile = Join-Path $BackupDir "complete_dump_$Timestamp.sql"
Write-Log "Exporting complete database dump..."
pg_dump $DB_URL > $dumpFile 2>&1

if ((Test-Path $dumpFile) -and ((Get-Item $dumpFile).Length -gt 0)) {
    Write-Log "Complete dump exported successfully: $dumpFile"
} else {
    Write-Log "ERROR: Failed to export complete dump"
    exit 1
}

# Export schema only
$schemaFile = Join-Path $BackupDir "schema_$Timestamp.sql"
Write-Log "Exporting database schema..."
pg_dump --schema-only $DB_URL > $schemaFile 2>&1

if ((Test-Path $schemaFile) -and ((Get-Item $schemaFile).Length -gt 0)) {
    Write-Log "Schema exported successfully: $schemaFile"
} else {
    Write-Log "ERROR: Failed to export schema"
    exit 1
}

# Export data only
$dataFile = Join-Path $BackupDir "data_$Timestamp.sql"
Write-Log "Exporting database data..."
pg_dump --data-only $DB_URL > $dataFile 2>&1

if ((Test-Path $dataFile) -and ((Get-Item $dataFile).Length -gt 0)) {
    Write-Log "Data exported successfully: $dataFile"
} else {
    Write-Log "ERROR: Failed to export data"
    exit 1
}

# Create compressed archive
$archiveFile = Join-Path $BackupDir "supabase_backup_$Timestamp.zip"
Write-Log "Creating backup archive..."

$filesToArchive = Get-ChildItem -Path $BackupDir -Filter "*.sql" | ForEach-Object { $_.FullName }
Compress-Archive -Path $filesToArchive -DestinationPath $archiveFile -Force

if ((Test-Path $archiveFile) -and ((Get-Item $archiveFile).Length -gt 0)) {
    Write-Log "Archive created successfully: $archiveFile"
} else {
    Write-Log "ERROR: Failed to create archive"
    exit 1
}

# Upload backup to GitHub repository
Write-Log "Uploading backup to GitHub repository..."

# Configure git if not already configured
git config --global user.name "GitHub Actions" 2>$null
git config --global user.email "actions@github.com" 2>$null

# Create backups directory in repository if it doesn't exist
if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" -Force | Out-Null
}

# Copy backup files to repository backups directory
Copy-Item "$BackupDir\*.sql" "backups\" -Force -ErrorAction SilentlyContinue
Copy-Item "$BackupDir\*.zip" "backups\" -Force -ErrorAction SilentlyContinue

# Add and commit backup files
git add backups/ 2>$null
git commit -m "Add database backup - $Timestamp" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Log "Backup files committed to git"
} else {
    Write-Log "No changes to commit or already committed"
}

# Push to main branch
git push origin main 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Log "Backup pushed to GitHub successfully"
} else {
    Write-Log "Failed to push to GitHub (this is normal in non-GitHub Actions environment)"
}

Write-Log "Backup upload process completed"

# Display summary
Write-Host ""
Write-Host "=== BACKUP SUMMARY ===" -ForegroundColor Green
Write-Host "Backup Directory: $BackupDir"
Write-Host "Archive File: supabase_backup_$Timestamp.zip"
$totalSize = [math]::Round((Get-ChildItem -Path $BackupDir | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
Write-Host "Total Size: $totalSize MB"
Write-Host ""
Write-Log "Backup process completed successfully!"
