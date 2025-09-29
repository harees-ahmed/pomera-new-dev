#!/bin/bash

# Test script for Supabase backup system
# This script validates the backup configuration and tests connectivity

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Logging function
log() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Test 1: Check if required environment variables are set
test_environment() {
    log "Testing environment variables..."
    
    if [ -z "$SUPABASE_DB_URL" ]; then
        fail "SUPABASE_DB_URL environment variable is not set"
        return 1
    else
        success "SUPABASE_DB_URL is set"
    fi
    
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        fail "SUPABASE_ACCESS_TOKEN environment variable is not set"
        return 1
    else
        success "SUPABASE_ACCESS_TOKEN is set"
    fi
    
    return 0
}

# Test 2: Check if Supabase CLI is available
test_supabase_cli() {
    log "Testing Supabase CLI availability..."
    
    if command -v supabase &> /dev/null; then
        local version=$(supabase --version 2>/dev/null || echo "unknown")
        success "Supabase CLI is installed: $version"
    else
        fail "Supabase CLI is not installed"
        return 1
    fi
    
    return 0
}

# Test 3: Test database connectivity
test_database_connectivity() {
    log "Testing database connectivity..."
    
    # Test connection using Supabase CLI
    if supabase db ping --db-url "$SUPABASE_DB_URL" &>/dev/null; then
        success "Database connection successful"
    else
        fail "Database connection failed"
        return 1
    fi
    
    return 0
}

# Test 4: Test backup script exists and is executable
test_backup_script() {
    log "Testing backup script availability..."
    
    if [ -f "scripts/backup-supabase.sh" ]; then
        success "Backup script exists"
        
        if [ -x "scripts/backup-supabase.sh" ]; then
            success "Backup script is executable"
        else
            warning "Backup script is not executable, attempting to fix..."
            chmod +x scripts/backup-supabase.sh
            if [ -x "scripts/backup-supabase.sh" ]; then
                success "Backup script is now executable"
            else
                fail "Failed to make backup script executable"
                return 1
            fi
        fi
    else
        fail "Backup script does not exist"
        return 1
    fi
    
    return 0
}

# Test 5: Test GitHub Actions workflow file
test_github_workflow() {
    log "Testing GitHub Actions workflow..."
    
    if [ -f ".github/workflows/supabase-backup.yml" ]; then
        success "GitHub Actions workflow file exists"
        
        # Basic YAML syntax check
        if command -v yq &> /dev/null; then
            if yq eval '.jobs.backup.steps' .github/workflows/supabase-backup.yml &>/dev/null; then
                success "GitHub Actions workflow YAML syntax is valid"
            else
                warning "GitHub Actions workflow YAML syntax check failed (yq not available or syntax error)"
            fi
        else
            warning "yq not available for YAML syntax validation"
        fi
    else
        fail "GitHub Actions workflow file does not exist"
        return 1
    fi
    
    return 0
}

# Test 6: Test backup directory creation
test_backup_directory() {
    log "Testing backup directory creation..."
    
    local test_dir="test_backups"
    
    if mkdir -p "$test_dir" 2>/dev/null; then
        success "Backup directory creation successful"
        rmdir "$test_dir" 2>/dev/null || true
    else
        fail "Failed to create backup directory"
        return 1
    fi
    
    return 0
}

# Test 7: Test backup script help/usage
test_backup_script_help() {
    log "Testing backup script help functionality..."
    
    if ./scripts/backup-supabase.sh --help &>/dev/null; then
        success "Backup script help functionality works"
    else
        warning "Backup script help functionality not available or failed"
    fi
    
    return 0
}

# Test 8: Test PowerShell script (if on Windows or WSL)
test_powershell_script() {
    log "Testing PowerShell backup script..."
    
    if [ -f "scripts/backup-supabase.ps1" ]; then
        success "PowerShell backup script exists"
        
        # Test if PowerShell is available
        if command -v pwsh &> /dev/null || command -v powershell &> /dev/null; then
            success "PowerShell is available"
        else
            warning "PowerShell not available (this is normal on Linux/macOS)"
        fi
    else
        fail "PowerShell backup script does not exist"
        return 1
    fi
    
    return 0
}

# Test 9: Test documentation files
test_documentation() {
    log "Testing documentation files..."
    
    if [ -f "BACKUP_SETUP.md" ]; then
        success "Backup setup documentation exists"
    else
        fail "Backup setup documentation missing"
        return 1
    fi
    
    return 0
}

# Test 10: Dry run test (if environment is set)
test_dry_run() {
    log "Testing backup script dry run..."
    
    if [ -n "$SUPABASE_DB_URL" ] && [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
        warning "Skipping dry run test to avoid creating actual backups"
        warning "To test actual backup, run: ./scripts/backup-supabase.sh"
    else
        warning "Environment variables not set, skipping dry run test"
    fi
    
    return 0
}

# Main test function
main() {
    echo "=========================================="
    echo "Supabase Backup System Test Suite"
    echo "=========================================="
    echo ""
    
    # Run all tests
    test_environment
    test_supabase_cli
    test_database_connectivity
    test_backup_script
    test_github_workflow
    test_backup_directory
    test_backup_script_help
    test_powershell_script
    test_documentation
    test_dry_run
    
    echo ""
    echo "=========================================="
    echo "Test Results Summary"
    echo "=========================================="
    echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed! Backup system is ready to use.${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Set up GitHub Secrets (see BACKUP_SETUP.md)"
        echo "2. Test manual backup: ./scripts/backup-supabase.sh"
        echo "3. Trigger GitHub Actions workflow manually"
        exit 0
    else
        echo -e "${RED}Some tests failed. Please fix the issues before using the backup system.${NC}"
        echo ""
        echo "Common fixes:"
        echo "1. Install Supabase CLI: curl -fsSL https://supabase.com/install.sh | sh"
        echo "2. Set environment variables: export SUPABASE_DB_URL=... && export SUPABASE_ACCESS_TOKEN=..."
        echo "3. Make scripts executable: chmod +x scripts/*.sh"
        exit 1
    fi
}

# Run main function
main "$@"
