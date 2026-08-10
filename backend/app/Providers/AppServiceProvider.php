<?php

namespace App\Providers;

use App\Services\AI\Adapters\GeminiVisionAdapter;
use App\Services\AI\Adapters\MockAiAdapter;
use App\Services\AI\Adapters\OpenAiVisionAdapter;
use App\Services\AI\Contracts\IdentityVerifierInterface;
use App\Services\AI\Contracts\ImageGeneratorInterface;
use App\Services\AI\Contracts\LLMProviderInterface;
use App\Services\AI\Contracts\VisionProviderInterface;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $provider = env('AI_PROVIDER');
        $hasGemini = !empty(env('GEMINI_API_KEY'));
        $hasOpenAi = !empty(env('OPENAI_API_KEY'));

        if ($provider === 'gemini' || ($hasGemini && $provider !== 'mock')) {
            $this->app->singleton(VisionProviderInterface::class, GeminiVisionAdapter::class);
            $this->app->singleton(LLMProviderInterface::class, GeminiVisionAdapter::class);
        } elseif ($provider === 'openai' || ($hasOpenAi && $provider !== 'mock')) {
            $this->app->singleton(VisionProviderInterface::class, OpenAiVisionAdapter::class);
            $this->app->singleton(LLMProviderInterface::class, OpenAiVisionAdapter::class);
        } else {
            $this->app->singleton(VisionProviderInterface::class, MockAiAdapter::class);
            $this->app->singleton(LLMProviderInterface::class, MockAiAdapter::class);
        }

        $this->app->singleton(ImageGeneratorInterface::class, MockAiAdapter::class);
        $this->app->singleton(IdentityVerifierInterface::class, MockAiAdapter::class);

        // Clear any pre-resolved cached instances of auth.password in IoC container
        if ($this->app instanceof \Illuminate\Container\Container) {
            $this->app->forgetInstance('auth.password');
            $this->app->forgetInstance('auth.password.broker');
            $this->app->forgetInstance(\Illuminate\Auth\Passwords\PasswordBrokerManager::class);
        }

        // Ensure app.key is never empty or quoted when PasswordBrokerManager is resolved
        $this->app->singleton(\Illuminate\Auth\Passwords\PasswordBrokerManager::class, function ($app) {
            $rawKey = $app['config']['app.key'] ?? env('APP_KEY');
            $cleanKey = trim((string)$rawKey, " \t\n\r\0\x0B\"'");
            if (empty($cleanKey) || $cleanKey === 'base64:' || strlen($cleanKey) < 10) {
                $cleanKey = 'base64:G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=';
            }
            $app['config']->set('app.key', $cleanKey);
            return new \App\Services\Auth\CustomPasswordBrokerManager($app);
        });

        $this->app->singleton('auth.password', function ($app) {
            return $app->make(\Illuminate\Auth\Passwords\PasswordBrokerManager::class);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $rawKey = config('app.key') ?: env('APP_KEY');
        $cleanKey = trim((string)$rawKey, " \t\n\r\0\x0B\"'");
        if (empty($cleanKey) || $cleanKey === 'base64:' || strlen($cleanKey) < 10) {
            $cleanKey = 'base64:G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=';
        }
        config(['app.key' => $cleanKey]);

        // Dynamic Railway Runtime Database Resolver (Overrides stale config cache)
        $dbUrl = env('DB_URL') ?: env('DATABASE_URL');
        $pgHost = env('DB_HOST') ?: env('PGHOST');
        $mysqlHost = env('MYSQLHOST');
        $dbConn = env('DB_CONNECTION');

        if (empty($dbConn)) {
            if (!empty($mysqlHost)) {
                $dbConn = 'mysql';
            } elseif (!empty($pgHost) || !empty($dbUrl)) {
                $dbConn = 'pgsql';
            } else {
                $dbConn = 'sqlite';
            }
        }

        config(['database.default' => $dbConn]);

        if (!empty($dbUrl)) {
            config(["database.connections.{$dbConn}.url" => $dbUrl]);
        }
        if (!empty($mysqlHost)) {
            config([
                'database.connections.mysql.host' => env('DB_HOST') ?: env('MYSQLHOST', '127.0.0.1'),
                'database.connections.mysql.port' => env('DB_PORT') ?: env('MYSQLPORT', '3306'),
                'database.connections.mysql.database' => env('DB_DATABASE') ?: env('MYSQLDATABASE', 'laravel'),
                'database.connections.mysql.username' => env('DB_USERNAME') ?: env('MYSQLUSER', 'root'),
                'database.connections.mysql.password' => env('DB_PASSWORD') ?: env('MYSQLPASSWORD', ''),
            ]);
        }
        if (!empty($pgHost)) {
            config([
                'database.connections.pgsql.host' => $pgHost,
                'database.connections.pgsql.port' => env('DB_PORT') ?: env('PGPORT', '5432'),
                'database.connections.pgsql.database' => env('DB_DATABASE') ?: env('PGDATABASE', 'postgres'),
                'database.connections.pgsql.username' => env('DB_USERNAME') ?: env('PGUSER', 'postgres'),
                'database.connections.pgsql.password' => env('DB_PASSWORD') ?: env('PGPASSWORD', ''),
            ]);
        }
        if ($dbConn === 'sqlite') {
            $sqlitePath = env('DB_DATABASE') ?: database_path('database.sqlite');
            if (!file_exists($sqlitePath) && str_contains($sqlitePath, '.sqlite')) {
                @mkdir(dirname($sqlitePath), 0755, true);
                @touch($sqlitePath);
            }
            config(['database.connections.sqlite.database' => $sqlitePath]);
        }

        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = env('FRONTEND_URL') ?: config('app.frontend_url');
            
            // If running in production or web request without explicit localhost FRONTEND_URL
            if (empty($frontendUrl) || (str_contains($frontendUrl, 'localhost') && app()->environment('production'))) {
                $frontendUrl = 'https://mybarber.my.id';
            } elseif (request()->hasHeader('X-Forwarded-Host') || (request()->getHost() && request()->getHost() !== 'localhost')) {
                $scheme = request()->getScheme();
                $host = request()->header('X-Forwarded-Host') ?: request()->getHost();
                $frontendUrl = "{$scheme}://{$host}";
            }

            $frontendUrl = rtrim((string)$frontendUrl, '/');
            return "{$frontendUrl}/auth/reset-password?token={$token}&email=" . urlencode($notifiable->getEmailForPasswordReset());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perHour(3)->by($request->ip());
        });

        RateLimiter::for('email-verification', function (Request $request) {
            return Limit::perHour(3)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('public-master-data', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('ai-consultation', function (Request $request) {
            return Limit::perDay(5)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('ai-preview', function (Request $request) {
            return Limit::perDay(3)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('ai-chat', function (Request $request) {
            return Limit::perDay(20)->by($request->user()?->id ?: $request->ip());
        });
    }
}
