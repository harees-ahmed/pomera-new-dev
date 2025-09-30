# Database Backups

This directory contains automated database backups created by GitHub Actions.

## Backup Files

- **`complete_dump_YYYYMMDD_HHMMSS.sql`** - Complete database dump including schema and data
- **`schema_YYYYMMDD_HHMMSS.sql`** - Database schema only (tables, indexes, constraints)
- **`data_YYYYMMDD_HHMMSS.sql`** - Database data only (records from all tables)
- **`supabase_backup_YYYYMMDD_HHMMSS.tar.gz`** - Compressed archive containing all backup files

## Backup Schedule

Backups are automatically created:
- **Daily at 2:00 AM UTC** via GitHub Actions
- **Manually triggered** via GitHub Actions workflow dispatch

## Backup Process

1. Connects directly to Supabase PostgreSQL database
2. Creates three separate dumps (complete, schema, data)
3. Compresses all files into a tar.gz archive
4. Commits backup files to this repository
5. Pushes changes to the main branch

## Restoring from Backup

To restore the database from a backup:

```bash
# Restore complete database
psql "postgresql://postgres:password@host:port/database" < complete_dump_YYYYMMDD_HHMMSS.sql

# Or restore schema and data separately
psql "postgresql://postgres:password@host:port/database" < schema_YYYYMMDD_HHMMSS.sql
psql "postgresql://postgres:password@host:port/database" < data_YYYYMMDD_HHMMSS.sql
```

## Security Note

These backup files contain sensitive database information. Access to this repository should be restricted to authorized personnel only.

## Backup Retention

- GitHub Actions artifacts: 30 days
- Repository commits: Permanent (can be cleaned up manually if needed)
