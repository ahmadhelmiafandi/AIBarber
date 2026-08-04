#!/bin/sh
set -e

# Ensure storage directories exist
mkdir -p /var/www/storage/logs
mkdir -p /var/www/storage/framework/sessions
mkdir -p /var/www/storage/framework/views
mkdir -p /var/www/storage/framework/cache/data
mkdir -p /var/www/storage/app/public/ai_uploads

# Clear any stale config cache (Railway injects env at runtime)
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# Run database migrations
php artisan migrate --force 2>/dev/null || true

# Create storage link
php artisan storage:link 2>/dev/null || true

# Start the application
exec php artisan serve --host=0.0.0.0 --port=8000
