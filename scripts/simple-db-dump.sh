#!/bin/bash

# Simple Supabase Database Dump Script
# Uses hardcoded connection string for direct PostgreSQL access

set -e  # Exit on any error

# Hardcoded database connection
DB_URL="postgresql://postgres:R2xjCa9f4\$iRB9b@db.mygfpmrnixbejrpujwlu.supabase.co:5432/postgres"

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
LOG_FILE="backup_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log "Created backup directory: $BACKUP_DIR"
}

# Check if pg_dump is available
check_pg_dump() {
    if ! command -v pg_dump &> /dev/null; then
        log "Installing PostgreSQL client tools..."
        # Install PostgreSQL client tools
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y postgresql-client
        elif command -v yum &> /dev/null; then
            sudo yum install -y postgresql
        elif command -v brew &> /dev/null; then
            brew install postgresql
        else
            error "Cannot install PostgreSQL client tools. Please install manually."
        fi
    else
        log "PostgreSQL client tools already installed"
    fi
}

# Export complete database dump
export_complete_dump() {
    local dump_file="$BACKUP_DIR/complete_dump_${TIMESTAMP}.sql"
    log "Exporting complete database dump..."
    
    pg_dump "$DB_URL" > "$dump_file" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$dump_file" ] && [ -s "$dump_file" ]; then
        log "Complete dump exported successfully: $dump_file"
        echo "BACKUP_FILE=complete_dump_${TIMESTAMP}.sql" >> "$GITHUB_ENV" 2>/dev/null || true
    else
        error "Failed to export complete dump"
    fi
}

# Export schema only
export_schema() {
    local schema_file="$BACKUP_DIR/schema_${TIMESTAMP}.sql"
    log "Exporting database schema..."
    
    pg_dump --schema-only "$DB_URL" > "$schema_file" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$schema_file" ] && [ -s "$schema_file" ]; then
        log "Schema exported successfully: $schema_file"
    else
        error "Failed to export schema"
    fi
}

# Export data only
export_data() {
    local data_file="$BACKUP_DIR/data_${TIMESTAMP}.sql"
    log "Exporting database data..."
    
    pg_dump --data-only "$DB_URL" > "$data_file" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$data_file" ] && [ -s "$data_file" ]; then
        log "Data exported successfully: $data_file"
    else
        error "Failed to export data"
    fi
}

# Create compressed archive
create_archive() {
    local archive_file="$BACKUP_DIR/supabase_backup_${TIMESTAMP}.tar.gz"
    log "Creating backup archive..."
    
    tar -czf "$archive_file" "$BACKUP_DIR"/*.sql "$LOG_FILE" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$archive_file" ] && [ -s "$archive_file" ]; then
        log "Archive created successfully: $archive_file"
        echo "BACKUP_FILE=supabase_backup_${TIMESTAMP}.tar.gz" >> "$GITHUB_ENV" 2>/dev/null || true
    else
        error "Failed to create archive"
    fi
}

# Generate backup report
generate_report() {
    local report_file="$BACKUP_DIR/backup_report_${TIMESTAMP}.txt"
    
    cat > "$report_file" << EOF
Supabase Database Backup Report
===============================
Date: $(date)
Timestamp: $TIMESTAMP
Backup Directory: $BACKUP_DIR
Database URL: postgresql://postgres:***@db.mygfpmrnixbejrpujwlu.supabase.co:5432/postgres

Files Created:
$(ls -la "$BACKUP_DIR"/*.sql "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No files found")

Backup Sizes:
$(du -h "$BACKUP_DIR"/*.sql "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No files found")

Log Summary:
$(tail -20 "$LOG_FILE" 2>/dev/null || echo "No log file")

EOF
    
    log "Backup report generated: $report_file"
}

# Main backup function
main() {
    log "Starting simple Supabase database backup process..."
    log "Using hardcoded database connection"
    
    create_backup_dir
    check_pg_dump
    
    export_complete_dump
    export_schema
    export_data
    
    create_archive
    upload_to_github
    generate_report
    
    log "Backup process completed successfully!"
    log "Backup files location: $BACKUP_DIR"
    
    # Display summary
    echo ""
    echo "=== BACKUP SUMMARY ==="
    echo "Backup Directory: $BACKUP_DIR"
    echo "Archive File: supabase_backup_${TIMESTAMP}.tar.gz"
    echo "Log File: $LOG_FILE"
    echo "Total Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
    echo ""
}

# Run main function
main "$@"
