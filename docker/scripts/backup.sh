#!/bin/bash
set -e

# ============================================
# PostgreSQL Automated Daily Backup Script
# ============================================

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgres}"
CONTAINER_NAME="${CONTAINER_NAME:-postgres}"
DB_NAME="${DB_DATABASE:-aibarber_prod}"
DB_USER="${DB_USERNAME:-aibarber_user}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

BACKUP_FILENAME="${DB_NAME}_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"

echo "[$(date)] Starting PostgreSQL backup for ${DB_NAME}..."

docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_PATH"

if [ -f "$BACKUP_PATH" ] && [ -s "$BACKUP_PATH" ]; then
    echo "[$(date)] Backup completed successfully: ${BACKUP_PATH}"
else
    echo "[$(date)] ERROR: Backup file is empty or failed to generate!"
    exit 1
fi

# Prune old backups older than RETENTION_DAYS
echo "[$(date)] Pruning backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} \;

echo "[$(date)] Backup routine finished."
