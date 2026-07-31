#!/bin/bash
set -e

# ============================================
# Backup & Restore Automated Verification Test
# ============================================

TEST_DIR="/tmp/aibarber_backup_test"
mkdir -p "$TEST_DIR"

export BACKUP_DIR="$TEST_DIR"
export RETENTION_DAYS="1"

echo "1. Running backup script..."
bash ./docker/scripts/backup.sh

LATEST_BACKUP=$(find "$TEST_DIR" -type f -name "*.sql.gz" | sort -r | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "FAIL: Backup file not generated."
    exit 1
fi

echo "2. Validating backup file size..."
if [ ! -s "$LATEST_BACKUP" ]; then
    echo "FAIL: Backup file is empty."
    exit 1
fi

echo "3. Testing restore capability..."
bash ./docker/scripts/restore.sh "$LATEST_BACKUP"

echo "SUCCESS: Backup and restore routine verified cleanly!"
rm -rf "$TEST_DIR"
