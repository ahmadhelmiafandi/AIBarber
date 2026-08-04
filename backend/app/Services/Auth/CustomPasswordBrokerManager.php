<?php

namespace App\Services\Auth;

use Illuminate\Auth\Passwords\CacheTokenRepository;
use Illuminate\Auth\Passwords\DatabaseTokenRepository;
use Illuminate\Auth\Passwords\PasswordBrokerManager as BaseManager;

class CustomPasswordBrokerManager extends BaseManager
{
    protected function createTokenRepository(array $config)
    {
        $rawKey = $this->app['config']['app.key'] ?? env('APP_KEY', 'base64:G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=');
        $key = trim((string) $rawKey, " \t\n\r\0\x0B\"'");

        if (empty($key) || $key === 'base64:' || strlen($key) < 10) {
            $key = 'base64:G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=';
        }

        if (str_starts_with($key, 'base64:')) {
            $key = base64_decode(substr($key, 7));
        }

        if (empty($key)) {
            $key = base64_decode('G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=');
        }

        if (isset($config['driver']) && $config['driver'] === 'cache') {
            return new CacheTokenRepository(
                $this->app['cache']->store($config['store'] ?? null),
                $this->app['hash'],
                (string) $key,
                ($config['expire'] ?? 60) * 60,
                $config['throttle'] ?? 0
            );
        }

        return new DatabaseTokenRepository(
            $this->app['db']->connection($config['connection'] ?? null),
            $this->app['hash'],
            $config['table'],
            (string) $key,
            ($config['expire'] ?? 60) * 60,
            $config['throttle'] ?? 0
        );
    }
}
