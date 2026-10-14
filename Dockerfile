FROM serversideup/php:8.2-fpm-nginx-alpine
USER root
RUN install-php-extensions gd
USER www-data