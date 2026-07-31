#!/bin/bash
set -e

# ============================================
# PostgreSQL Automated Restore Script
# ============================================

if [ -z "$1" ]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${CONTAINER_NAME:-postgres}"
DB_NAME="${DB_DATABASE:-aibarber_prod}"
DB_USER="${DB_USERNAME:-aibarber_user}"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file '$BACKUP_FILE' does not exist."
    exit 1
fi

echo "[$(date)] Restoring database '${DB_NAME}' from '${BACKUP_FILE}'..."

# Terminate active database connections before restoring
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" || true

gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

echo "[$(date)] Database restore completed successfully."
