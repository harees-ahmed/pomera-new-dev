# Supabase Database Backup System

This document explains how to set up and use the automated Supabase database backup system for the Pomera Care project.

## Overview

The backup system consists of:
- **GitHub Actions workflow** (`.github/workflows/supabase-backup.yml`) - Automated daily backups
- **Backup scripts** - Manual backup execution
  - `scripts/backup-supabase.sh` - Linux/macOS script
  - `scripts/backup-supabase.ps1` - Windows PowerShell script
- **Comprehensive backups** including schema, data, roles, functions, and triggers

## GitHub Secrets Configuration

To enable the GitHub Actions workflow, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **SUPABASE_DB_URL**
   - Your Supabase database connection URL
   - Format: `postgresql://postgres:[password]@[host]:5432/postgres`
   - Found in: Supabase Dashboard → Settings → Database → Connection string

2. **SUPABASE_ACCESS_TOKEN**
   - Your Supabase access token for API authentication
   - Found in: Supabase Dashboard → Settings → API → Project API keys → service_role key

### Optional Secrets (for cloud storage)

3. **AWS_ACCESS_KEY_ID** (optional)
   - AWS access key for S3 uploads
   - Only needed if you want to store backups in AWS S3

4. **AWS_SECRET_ACCESS_KEY** (optional)
   - AWS secret key for S3 uploads

5. **AWS_DEFAULT_REGION** (optional)
   - AWS region for S3 bucket
   - Example: `us-east-1`

6. **S3_BUCKET_NAME** (optional)
   - S3 bucket name for storing backups
   - Example: `pomera-supabase-backups`

## Setting Up GitHub Secrets

### Method 1: GitHub Web Interface

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact name and value

### Method 2: GitHub CLI

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Set secrets
gh secret set SUPABASE_DB_URL --body "your_database_url_here"
gh secret set SUPABASE_ACCESS_TOKEN --body "your_access_token_here"
gh secret set AWS_ACCESS_KEY_ID --body "your_aws_key_here"
gh secret set AWS_SECRET_ACCESS_KEY --body "your_aws_secret_here"
gh secret set AWS_DEFAULT_REGION --body "us-east-1"
gh secret set S3_BUCKET_NAME --body "your_bucket_name_here"
```

## Workflow Configuration

### Schedule

The workflow runs daily at 2:00 AM UTC by default. To change the schedule:

1. Edit `.github/workflows/supabase-backup.yml`
2. Modify the cron expression:
   ```yaml
   schedule:
     - cron: '0 2 * * *'  # Daily at 2:00 AM UTC
   ```

### Manual Execution

You can trigger the backup manually:

1. Go to **Actions** tab in your GitHub repository
2. Select **Daily Supabase Database Backup**
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## Local Backup Execution

### Prerequisites

1. **Node.js** (version 20 or higher) - for GitHub Actions
2. **Supabase CLI** (will be installed automatically using official method)
3. **Environment variables** set

### Environment Variables

Set these environment variables before running the backup:

```bash
# Linux/macOS
export SUPABASE_DB_URL="your_database_url_here"
export SUPABASE_ACCESS_TOKEN="your_access_token_here"

# Windows PowerShell
$env:SUPABASE_DB_URL = "your_database_url_here"
$env:SUPABASE_ACCESS_TOKEN = "your_access_token_here"
```

### Running Backups

#### Linux/macOS
```bash
# Make script executable
chmod +x scripts/backup-supabase.sh

# Run backup
./scripts/backup-supabase.sh

# With custom options
./scripts/backup-supabase.sh --backup-dir /path/to/backups --retention-days 14
```

#### Windows PowerShell
```powershell
# Run backup
.\scripts\backup-supabase.ps1

# With custom options
.\scripts\backup-supabase.ps1 -BackupDir "C:\backups" -RetentionDays 14

# Show help
.\scripts\backup-supabase.ps1 -Help
```

## Backup Contents

Each backup includes:

### 1. Schema Backup (`schema_YYYYMMDD_HHMMSS.sql`)
- Table definitions
- Indexes
- Constraints
- RLS policies
- Triggers

### 2. Data Backup (`data_YYYYMMDD_HHMMSS.sql`)
- All table data
- Preserves data integrity
- Includes dimension tables

### 3. Roles Backup (`roles_YYYYMMDD_HHMMSS.sql`)
- Database roles
- User permissions
- Access control settings

### 4. Functions Backup (`functions_YYYYMMDD_HHMMSS.sql`)
- Custom functions
- Stored procedures
- Triggers

### 5. Complete Archive (`supabase_backup_YYYYMMDD_HHMMSS.tar.gz` or `.zip`)
- All SQL files compressed
- Backup log
- Backup report

## Backup Storage

### GitHub Actions Artifacts
- Backups are stored as GitHub Actions artifacts
- Available for 30 days
- Can be downloaded manually

### Cloud Storage (Optional)
- Uploads to AWS S3 if configured
- Organized by date
- Long-term storage solution

### Local Storage
- Stored in `backups/` directory
- Automatic cleanup of old backups
- Configurable retention period

## Monitoring and Alerts

### GitHub Actions
- Check the **Actions** tab for workflow status
- Failed runs will show error details
- Email notifications can be configured

### Backup Verification
- Each backup includes a report file
- Log files contain detailed execution information
- File sizes and timestamps are recorded

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify `SUPABASE_ACCESS_TOKEN` is correct
   - Check token permissions in Supabase dashboard

2. **Connection Errors**
   - Verify `SUPABASE_DB_URL` is correct
   - Check network connectivity
   - Ensure database is accessible

3. **Permission Errors**
   - Ensure service role has necessary permissions
   - Check RLS policies don't block backup operations

4. **Storage Errors**
   - Verify AWS credentials if using S3
   - Check S3 bucket permissions
   - Ensure sufficient disk space locally

5. **Supabase CLI Installation Errors**
   - Use the official installation method: `curl -fsSL https://supabase.com/install.sh | sh`
   - Do not use `npm install -g supabase@latest` as it's not supported
   - Ensure the CLI is in your PATH: `export PATH="$HOME/.local/bin:$PATH"`
   - For Windows, use WSL or Git Bash for installation

### Debug Mode

To run with verbose logging:

```bash
# Add debug flag to see detailed output
export DEBUG=true
./scripts/backup-supabase.sh
```

## Security Considerations

1. **Secrets Management**
   - Never commit secrets to version control
   - Use GitHub Secrets for sensitive data
   - Rotate access tokens regularly

2. **Backup Access**
   - Limit access to backup files
   - Encrypt sensitive backups
   - Monitor backup access logs

3. **Network Security**
   - Use secure connections (SSL/TLS)
   - Restrict database access by IP
   - Implement proper firewall rules

## Recovery Process

### Restoring from Backup

1. **Download backup files** from GitHub Actions artifacts or cloud storage
2. **Extract the archive** to get individual SQL files
3. **Restore in order**:
   ```bash
   # Restore schema first
   psql -h your-host -U postgres -d postgres -f schema_YYYYMMDD_HHMMSS.sql
   
   # Then restore roles
   psql -h your-host -U postgres -d postgres -f roles_YYYYMMDD_HHMMSS.sql
   
   # Finally restore data
   psql -h your-host -U postgres -d postgres -f data_YYYYMMDD_HHMMSS.sql
   ```

### Testing Backups

Regularly test backup restoration:
1. Create a test database
2. Restore backup to test database
3. Verify data integrity
4. Test application functionality

## Maintenance

### Regular Tasks

1. **Monitor backup success** - Check GitHub Actions weekly
2. **Test restoration** - Monthly restore tests
3. **Update credentials** - Rotate tokens quarterly
4. **Review retention** - Adjust retention periods as needed
5. **Clean up old backups** - Automated cleanup runs daily

### Performance Optimization

1. **Schedule during low usage** - Run backups during off-peak hours
2. **Monitor database load** - Ensure backups don't impact performance
3. **Optimize retention** - Balance storage costs with recovery needs
4. **Compress backups** - Use compression to reduce storage requirements

## Support

For issues or questions:
1. Check the backup logs for error details
2. Verify all secrets are correctly configured
3. Test connectivity to Supabase database
4. Review GitHub Actions workflow logs

## Version History

- **v1.0** - Initial backup system with GitHub Actions workflow
- **v1.1** - Added PowerShell script for Windows support
- **v1.2** - Enhanced error handling and logging
- **v1.3** - Added cloud storage support and comprehensive documentation
