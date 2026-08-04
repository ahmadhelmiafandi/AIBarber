FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd

# Install Redis PHP extension
RUN pecl install redis && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . /var/www

RUN composer install --optimize-autoloader --no-dev

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Make entrypoint executable
RUN chmod +x /var/www/docker-entrypoint.sh

# Render Web Service uses artisan serve; Docker Compose uses php-fpm
EXPOSE 8000 9000

# Use entrypoint script to clear cached config before starting
CMD ["/var/www/docker-entrypoint.sh"]
