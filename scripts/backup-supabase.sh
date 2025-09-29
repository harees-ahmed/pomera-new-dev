#!/bin/bash

# Supabase Database Backup Script
# This script creates comprehensive backups of Supabase database including:
# - Database schema
# - Data (all tables)
# - Roles and permissions
# - Functions and triggers
# - RLS policies

set -e  # Exit on any error

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
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

# Check if required environment variables are set
check_env() {
    if [ -z "$SUPABASE_DB_URL" ]; then
        error "SUPABASE_DB_URL environment variable is required"
    fi
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        error "SUPABASE_ACCESS_TOKEN environment variable is required"
    fi
    
    log "Environment variables validated"
}

# Create backup directory
create_backup_dir() {
    mkdir -p "$BACKUP_DIR"
    log "Created backup directory: $BACKUP_DIR"
}

# Install Supabase CLI if not present
install_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        log "Installing Supabase CLI..."
        # Use the official installation method
        curl -fsSL https://supabase.com/install.sh | sh
        # Add to PATH if not already there
        if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
            export PATH="$HOME/.local/bin:$PATH"
        fi
    else
        log "Supabase CLI already installed"
    fi
}

# Export database schema
export_schema() {
    local schema_file="$BACKUP_DIR/schema_${TIMESTAMP}.sql"
    log "Exporting database schema..."
    
    supabase db dump --db-url "$SUPABASE_DB_URL" \
        --schema-only \
        --file "$schema_file" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$schema_file" ] && [ -s "$schema_file" ]; then
        log "Schema exported successfully: $schema_file"
    else
        error "Failed to export schema"
    fi
}

# Export database data
export_data() {
    local data_file="$BACKUP_DIR/data_${TIMESTAMP}.sql"
    log "Exporting database data..."
    
    supabase db dump --db-url "$SUPABASE_DB_URL" \
        --data-only \
        --file "$data_file" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$data_file" ] && [ -s "$data_file" ]; then
        log "Data exported successfully: $data_file"
    else
        error "Failed to export data"
    fi
}

# Export roles and permissions
export_roles() {
    local roles_file="$BACKUP_DIR/roles_${TIMESTAMP}.sql"
    log "Exporting roles and permissions..."
    
    supabase db dump --db-url "$SUPABASE_DB_URL" \
        --role-only \
        --file "$roles_file" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$roles_file" ] && [ -s "$roles_file" ]; then
        log "Roles exported successfully: $roles_file"
    else
        error "Failed to export roles"
    fi
}

# Export functions and triggers
export_functions() {
    local functions_file="$BACKUP_DIR/functions_${TIMESTAMP}.sql"
    log "Exporting functions and triggers..."
    
    supabase db dump --db-url "$SUPABASE_DB_URL" \
        --function-only \
        --file "$functions_file" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$functions_file" ] && [ -s "$functions_file" ]; then
        log "Functions exported successfully: $functions_file"
    else
        warning "No functions found or failed to export functions"
    fi
}

# Create complete backup archive
create_archive() {
    local archive_file="$BACKUP_DIR/supabase_backup_${TIMESTAMP}.tar.gz"
    log "Creating backup archive..."
    
    tar -czf "$archive_file" "$BACKUP_DIR"/*.sql "$LOG_FILE" 2>&1 | tee -a "$LOG_FILE"
    
    if [ -f "$archive_file" ] && [ -s "$archive_file" ]; then
        log "Archive created successfully: $archive_file"
        echo "BACKUP_FILE=$archive_file" >> "$GITHUB_ENV" 2>/dev/null || true
    else
        error "Failed to create archive"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    local retention_days=${BACKUP_RETENTION_DAYS:-7}
    log "Cleaning up backups older than $retention_days days..."
    
    find "$BACKUP_DIR" -name "*.sql" -mtime +$retention_days -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$retention_days -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.log" -mtime +$retention_days -delete 2>/dev/null || true
    
    log "Cleanup completed"
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
    log "Starting Supabase database backup process..."
    
    check_env
    create_backup_dir
    install_supabase_cli
    
    export_schema
    export_data
    export_roles
    export_functions
    
    create_archive
    cleanup_old_backups
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
